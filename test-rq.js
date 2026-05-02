const { QueryClient } = require('@tanstack/react-query');
const qc = new QueryClient();
qc.prefetchQuery({ queryKey: ['test'], queryFn: () => new Promise(r => setTimeout(r, 1000)) });
const state = qc.getQueryCache().find({ queryKey: ['test'] }).state;
console.log('status:', state.status);
console.log('fetchStatus:', state.fetchStatus);
