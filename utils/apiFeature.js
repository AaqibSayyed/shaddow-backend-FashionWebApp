class ApiFeature{
    constructor(query, queryString){
        this.query = query
        this.queryString = queryString
    }

    search(){
        let keyword = this.queryString.keyword ? {
           name:{
                $regex: this.queryString.keyword, 
                 $options: 'i'
            }
        } : {}

        this.query = this.query.find({...keyword})
        
        return this // returning whole class 
    }

    filter(){
        let queryFilter = {...this.queryString }

        if(queryFilter.subCategory){
            const subCategoryArray = queryFilter.subCategory['in'].split(',')
            queryFilter = {...queryFilter, subCategory: {...queryFilter.subCategor, in : subCategoryArray } }
        }

        let removeParam = ['keyword', 'page', 'limit']

        removeParam.forEach((value)=>{
            delete queryFilter[value]
        })

        let queryStr = JSON.stringify(queryFilter)
        
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (key) => `$${key}`)
        queryStr = JSON.parse(queryStr)
        
        this.query = this.query.find({...queryStr})
        
        return this
        
    }

    pagination(){
        const productPerPage = 6
        const page = Number(this.queryString.page) || 1
        const skip = productPerPage * (page - 1)

        this.query = this.query.find().limit(productPerPage).skip(skip)
        return  this
    }
}

module.exports = ApiFeature



