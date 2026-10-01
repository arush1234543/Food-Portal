export async function errorHandler(err, req, res, next) {
    if (err) {
        res.status(500).json({ success: true, message: "An unexpecter error occured" })
    }
    next()
}