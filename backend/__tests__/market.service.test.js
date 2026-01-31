import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// Mock coinGeckoService
const mockCoinGeckoService = {
    getCoinPrices: jest.fn(),
    getCoinsMarketData: jest.fn(),
    getCoinsList: jest.fn(),
    getSupportedCurrencies: jest.fn(),
    ping: jest.fn()
}

// Mock cryptoPanicService
const mockCryptoPanicService = {
    getNews: jest.fn(),
    getTrendingNews: jest.fn(),
    getHotNews: jest.fn()
}

// Mock fs module
const mockFs = {
    readFileSync: jest.fn()
}

jest.unstable_mockModule('../services/coinGecko.service.js', () => ({
    coinGeckoService: mockCoinGeckoService
}))

jest.unstable_mockModule('../services/cryptoPanic.service.js', () => ({
    cryptoPanicService: mockCryptoPanicService
}))

jest.unstable_mockModule('fs', () => ({
    default: mockFs,
    ...mockFs
}))

// Import after mocking
const { marketService } = await import('../api/market/market.service.js')

describe('Market Service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getCoinPrices', () => {
        it('should call coinGeckoService with correct parameters', async () => {
            const mockPrices = { bitcoin: { usd: 50000 } }
            mockCoinGeckoService.getCoinPrices.mockResolvedValue(mockPrices)

            const result = await marketService.getCoinPrices({
                ids: 'bitcoin',
                vs_currencies: 'usd'
            })

            expect(mockCoinGeckoService.getCoinPrices).toHaveBeenCalledWith(
                expect.objectContaining({
                    ids: 'bitcoin',
                    vs_currencies: 'usd'
                })
            )
            expect(result).toEqual(mockPrices)
        })

        it('should throw error if ids not provided', async () => {
            await expect(marketService.getCoinPrices({}))
                .rejects.toBe('Coin ids are required')
        })

        it('should convert boolean strings to booleans', async () => {
            mockCoinGeckoService.getCoinPrices.mockResolvedValue({})

            await marketService.getCoinPrices({
                ids: 'bitcoin',
                include_24hr_change: 'true',
                include_market_cap: 'false'
            })

            expect(mockCoinGeckoService.getCoinPrices).toHaveBeenCalledWith(
                expect.objectContaining({
                    include_24hr_change: true,
                    include_market_cap: false
                })
            )
        })

        it('should use default vs_currencies if not provided', async () => {
            mockCoinGeckoService.getCoinPrices.mockResolvedValue({})

            await marketService.getCoinPrices({ ids: 'bitcoin' })

            expect(mockCoinGeckoService.getCoinPrices).toHaveBeenCalledWith(
                expect.objectContaining({
                    vs_currencies: 'usd'
                })
            )
        })
    })

    describe('getCoinsMarketData', () => {
        it('should call coinGeckoService with correct parameters', async () => {
            const mockData = [{ id: 'bitcoin', current_price: 50000 }]
            mockCoinGeckoService.getCoinsMarketData.mockResolvedValue(mockData)

            const result = await marketService.getCoinsMarketData({
                ids: 'bitcoin,ethereum',
                vs_currency: 'usd',
                per_page: '10',
                page: '1'
            })

            expect(mockCoinGeckoService.getCoinsMarketData).toHaveBeenCalledWith(
                expect.objectContaining({
                    ids: ['bitcoin', 'ethereum'],
                    vs_currency: 'usd',
                    per_page: 10,
                    page: 1
                })
            )
            expect(result).toEqual(mockData)
        })

        it('should handle array ids parameter', async () => {
            mockCoinGeckoService.getCoinsMarketData.mockResolvedValue([])

            await marketService.getCoinsMarketData({
                ids: ['bitcoin', 'ethereum']
            })

            expect(mockCoinGeckoService.getCoinsMarketData).toHaveBeenCalledWith(
                expect.objectContaining({
                    ids: ['bitcoin', 'ethereum']
                })
            )
        })

        it('should use vs_currencies first element if vs_currency not provided', async () => {
            mockCoinGeckoService.getCoinsMarketData.mockResolvedValue([])

            await marketService.getCoinsMarketData({
                vs_currencies: ['eur', 'usd']
            })

            expect(mockCoinGeckoService.getCoinsMarketData).toHaveBeenCalledWith(
                expect.objectContaining({
                    vs_currency: 'eur'
                })
            )
        })

        it('should default to usd if no currency specified', async () => {
            mockCoinGeckoService.getCoinsMarketData.mockResolvedValue([])

            await marketService.getCoinsMarketData({})

            expect(mockCoinGeckoService.getCoinsMarketData).toHaveBeenCalledWith(
                expect.objectContaining({
                    vs_currency: 'usd'
                })
            )
        })

        it('should convert sparkline string to boolean', async () => {
            mockCoinGeckoService.getCoinsMarketData.mockResolvedValue([])

            await marketService.getCoinsMarketData({ sparkline: 'true' })

            expect(mockCoinGeckoService.getCoinsMarketData).toHaveBeenCalledWith(
                expect.objectContaining({
                    sparkline: true
                })
            )
        })
    })

    describe('getCoinsList', () => {
        it('should call coinGeckoService getCoinsList', async () => {
            const mockList = [{ id: 'bitcoin', symbol: 'btc' }]
            mockCoinGeckoService.getCoinsList.mockResolvedValue(mockList)

            const result = await marketService.getCoinsList()

            expect(mockCoinGeckoService.getCoinsList).toHaveBeenCalled()
            expect(result).toEqual(mockList)
        })
    })

    describe('getSupportedCurrencies', () => {
        it('should call coinGeckoService getSupportedCurrencies', async () => {
            const mockCurrencies = ['usd', 'eur', 'gbp']
            mockCoinGeckoService.getSupportedCurrencies.mockResolvedValue(mockCurrencies)

            const result = await marketService.getSupportedCurrencies()

            expect(mockCoinGeckoService.getSupportedCurrencies).toHaveBeenCalled()
            expect(result).toEqual(mockCurrencies)
        })
    })

    describe('pingCoinGecko', () => {
        it('should call coinGeckoService ping', async () => {
            const mockPing = { gecko_says: 'To the Moon!' }
            mockCoinGeckoService.ping.mockResolvedValue(mockPing)

            const result = await marketService.pingCoinGecko()

            expect(mockCoinGeckoService.ping).toHaveBeenCalled()
            expect(result).toEqual(mockPing)
        })
    })

    describe('getNews', () => {
        it('should read from static JSON file when USE_STATIC_NEWS is true', async () => {
            const mockNews = { results: [{ title: 'Bitcoin news' }] }
            mockFs.readFileSync.mockReturnValue(JSON.stringify(mockNews))

            const result = await marketService.getNews({})

            expect(result).toEqual(mockNews)
        })

        it('should throw error if static file read fails', async () => {
            mockFs.readFileSync.mockImplementation(() => {
                throw new Error('File not found')
            })

            await expect(marketService.getNews({}))
                .rejects.toBe('Failed to read static news file')
        })
    })

    describe('getTrendingNews', () => {
        it('should read from static JSON file when USE_STATIC_NEWS is true', async () => {
            const mockNews = { results: [{ title: 'Trending news' }] }
            mockFs.readFileSync.mockReturnValue(JSON.stringify(mockNews))

            const result = await marketService.getTrendingNews({})

            expect(result).toEqual(mockNews)
        })
    })

    describe('getHotNews', () => {
        it('should read from static JSON file when USE_STATIC_NEWS is true', async () => {
            const mockNews = { results: [{ title: 'Hot news' }] }
            mockFs.readFileSync.mockReturnValue(JSON.stringify(mockNews))

            const result = await marketService.getHotNews({})

            expect(result).toEqual(mockNews)
        })
    })
})

describe('Utility Functions (via marketService)', () => {
    describe('splitList behavior', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            mockCoinGeckoService.getCoinsMarketData.mockResolvedValue([])
        })

        it('should split comma-separated string into array', async () => {
            await marketService.getCoinsMarketData({ ids: 'bitcoin, ethereum, cardano' })

            expect(mockCoinGeckoService.getCoinsMarketData).toHaveBeenCalledWith(
                expect.objectContaining({
                    ids: ['bitcoin', 'ethereum', 'cardano']
                })
            )
        })

        it('should handle single value', async () => {
            await marketService.getCoinsMarketData({ ids: 'bitcoin' })

            expect(mockCoinGeckoService.getCoinsMarketData).toHaveBeenCalledWith(
                expect.objectContaining({
                    ids: ['bitcoin']
                })
            )
        })

        it('should pass null for undefined/null values', async () => {
            await marketService.getCoinsMarketData({})

            expect(mockCoinGeckoService.getCoinsMarketData).toHaveBeenCalledWith(
                expect.objectContaining({
                    ids: null
                })
            )
        })
    })

    describe('toBoolean behavior', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            mockCoinGeckoService.getCoinPrices.mockResolvedValue({})
        })

        it('should convert "true" string to true', async () => {
            await marketService.getCoinPrices({
                ids: 'bitcoin',
                include_market_cap: 'true'
            })

            expect(mockCoinGeckoService.getCoinPrices).toHaveBeenCalledWith(
                expect.objectContaining({
                    include_market_cap: true
                })
            )
        })

        it('should convert "false" string to false', async () => {
            await marketService.getCoinPrices({
                ids: 'bitcoin',
                include_market_cap: 'false'
            })

            expect(mockCoinGeckoService.getCoinPrices).toHaveBeenCalledWith(
                expect.objectContaining({
                    include_market_cap: false
                })
            )
        })

        it('should pass through boolean true', async () => {
            await marketService.getCoinPrices({
                ids: 'bitcoin',
                include_market_cap: true
            })

            expect(mockCoinGeckoService.getCoinPrices).toHaveBeenCalledWith(
                expect.objectContaining({
                    include_market_cap: true
                })
            )
        })

        it('should return undefined for other values', async () => {
            await marketService.getCoinPrices({
                ids: 'bitcoin',
                include_market_cap: 'yes'
            })

            expect(mockCoinGeckoService.getCoinPrices).toHaveBeenCalledWith(
                expect.objectContaining({
                    include_market_cap: undefined
                })
            )
        })
    })
})
