let cachedData = null
let lastFetchDate = null

export default async function handler(req, res) {
    const today = new Date().toDateString()

    if (cachedData && lastFetchDate === today) {
        return res.status(200).json(cachedData)
    }

    try {
        // Get USD → INR rate (free, no key needed)
        const fxRes = await fetch(
            "https://api.exchangerate.host/latest?base=USD&symbols=INR"
        )
        const fxData = await fxRes.json()

        const usdToInr = fxData.rates.INR

        // Use fixed daily gold & silver USD spot fallback
        // (This avoids unstable commodity APIs)

        const goldUSD = 2000   // You can update manually daily if needed
        const silverUSD = 25   // Same here

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
