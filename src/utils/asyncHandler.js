const asyncHandler=(requestHandler)=>{
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}




export {asyncHandler}

// const asyncHandler3=()=>{}
// const asyncHandler2=(func)=>{}
// const asyncHandler1=(func)=>{()=>{}} 
// const asyncHandler4=(func)=>async ()=>{}

// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }