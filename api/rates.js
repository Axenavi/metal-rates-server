let cachedData = null
let lastFetchDate = null

export default async function handler(req, res) {
    const today = new Date().toDateString()

    if (cachedData && lastFetchDate === today) {
        return res.status(200).json(cachedData)
    }

    try {
        const fxRes = await fetch(
            "https://api.exchangeratesapi.io/v1/latest?access_key=dbe4b0189962c2a1904b5d26b1c73a0c&symbols=INR,USD"
        )

        const fxData = await fxRes.json()

        if (!fxData.success) {
            return res.status(500).json({
                error: "Exchange API failed",
                details: fxData
            })
        }

        const metalRes = await fetch("https://api.metals.live/v1/spot")
        const metalData = await metalRes.json()

        if (!metalData) {
            return res.status(500).json({ error: "Metal API failed" })
        }

        const goldUSD = metalData.find(i => i.gold)?.gold
        const silverUSD = metalData.find(i => i.silver)?.silver

        const eurToInr = fxData.rates.INR
        const eurToUsd = fxData.rates.USD

        const usdToEur = 1 / eurToUsd
        const usdToInr = usdToEur * eurToInr

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
