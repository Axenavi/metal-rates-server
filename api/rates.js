let cachedData = null
let lastFetchDate = null

export default async function handler(req, res) {
    // ✅ Allow all origins (for Framer)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET")

    const today = new Date().toDateString()

    if (cachedData && lastFetchDate === today) {
        return res.status(200).json(cachedData)
    }

    try {
        const fxRes = await fetch(
            "https://open.er-api.com/v6/latest/USD"
        )
        const fxData = await fxRes.json()

        const usdToInr = fxData.rates.INR

        const goldUSD = 2000
        const silverUSD = 25

        const goldINR = (goldUSD * usdToInr) / 31.1035
        const silverINR = (silverUSD * usdToInr) / 31.1035

        cachedData = {
            gold: goldINR.toFixed(2),
            silver: silverINR.toFixed(2),
            updated: today
        }

        lastFetchDate = today

        return res.status(200).json(cachedData)

    } catch (error) {
        return res.status(500).json({
            error: "Server crashed",
            message: error.message
        })
    }
}
