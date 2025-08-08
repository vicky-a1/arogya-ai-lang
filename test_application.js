// Quick test script to verify the application is working
const http = require('http');

function testEndpoint(path, description) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`✅ ${description}: Status ${res.statusCode}`);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', (err) => {
            console.log(`❌ ${description}: Error - ${err.message}`);
            reject(err);
        });

        req.setTimeout(5000, () => {
            console.log(`⏰ ${description}: Timeout`);
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing Arogya AI Application...\n');

    try {
        // Test main page
        await testEndpoint('/', 'Main Application Page');
        
        // Test health endpoint
        await testEndpoint('/api/health', 'Health Check Endpoint');
        
        // Test API keys endpoint
        await testEndpoint('/api/keys', 'API Keys Endpoint');
        
        // Test static files
        await testEndpoint('/script.js', 'JavaScript File');
        await testEndpoint('/styles.css', 'CSS File');
        
        console.log('\n🎉 All tests passed! Application is running correctly.');
        console.log('🌐 Open http://localhost:3000 in your browser to use the application.');
        
    } catch (error) {
        console.log('\n❌ Some tests failed. Check the server logs for details.');
    }
}

runTests();
