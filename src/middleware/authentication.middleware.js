module.exports = (req,res,next) => {
    console.log("Passed through middleware");
    next();
}