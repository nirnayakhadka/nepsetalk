# Fix Top Losers Not Showing

## Plan Breakdown

- [x] Step 1: Edit backend/services/nepseDataService.js to populate `losers` and `turnoverLeaders` arrays in `fetchLiveData()`
- [x] Step 2: No fix needed (nepse routes use scheduler, not stockController)
- [x] Step 3: Tested /api/nepse/market – returns data with losers array
- [x] Step 4: Cleared Redis, triggered refresh
- [ ] Step 5: Verify frontend StockCharts shows Top Losers
- [ ] Step 6: attempt_completion

**Status:** Step 1 completed - added losers/turnoverLeaders to fetchLiveData(). Endpoint returns data.
