#!/bin/bash

# Build comprehensive documentation for Bouncer Backend

echo "📚 Building Bouncer Backend Documentation..."

# Generate TypeDoc documentation
echo "🔧 Generating TypeDoc API documentation..."
npm run docs:generate

# Check if generation was successful
if [ ! -d "docs/api" ]; then
    echo "❌ TypeDoc generation failed"
    exit 1
fi

# Add a redirect from root to proper index
cat > docs/api/root-redirect.html << 'REDIRECT_EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Bouncer Backend Documentation</title>
    <meta http-equiv="refresh" content="0; url=./index.html">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
        }
        .redirect-message {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="redirect-message">
        <h1>Bouncer Backend Documentation</h1>
        <p>Redirecting to documentation...</p>
        <p><a href="./index.html">Click here if not redirected</a></p>
    </div>
</body>
</html>
REDIRECT_EOF

echo "✅ Documentation built successfully!"
echo "📂 Files available in: docs/api/"
echo "🌐 Start server with: npm run docs:serve"
