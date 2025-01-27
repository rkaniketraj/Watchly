//  const asyncHandler =(func)=>async(req,resizeBy,next)=>{
//     try{
//         await func(req,res,next)
//     }
//     catch(error){
//         res.status(err.code||500).json({
//             success: false,
//             meassage:err.meassage
//         })
//     }
//  }
//try catch wla

//abb promise wala
const asyncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}
export {asyncHandler};



// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}
// higher order function which can take function as input