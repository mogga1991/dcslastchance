console.log('SAM_API_KEY:', process.env.SAM_API_KEY);
console.log('VITE_SAMGOV_API_KEY:', process.env.VITE_SAMGOV_API_KEY);
console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('SAM')));
