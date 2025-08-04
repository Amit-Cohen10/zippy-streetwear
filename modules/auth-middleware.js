const persist = require('./persist_module');

// Middleware to require authentication for protected routes
const requireAuth = async (req, res, next) => {
  try {
    const user = await persist.getUserFromToken(req);
    if (!user) {
      // For API routes, return JSON error
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // For page routes, show beautiful login required page
      return res.status(401).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Required - Zippy</title>
            <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Space Grotesk', sans-serif;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                    overflow: hidden;
                }
                
                .container {
                    text-align: center;
                    max-width: 600px;
                    padding: 2rem;
                    position: relative;
                    z-index: 2;
                }
                
                .background-animation {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }
                
                .grid-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-image: 
                        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
                    background-size: 50px 50px;
                    animation: grid-move 20s linear infinite;
                }
                
                @keyframes grid-move {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(50px, 50px); }
                }
                
                .neon-lines {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                
                .neon-line {
                    position: absolute;
                    background: linear-gradient(90deg, transparent, #00ffff, transparent);
                    height: 1px;
                    width: 100%;
                    animation: neon-flow 3s ease-in-out infinite;
                }
                
                .neon-line:nth-child(1) { top: 20%; animation-delay: 0s; }
                .neon-line:nth-child(2) { top: 40%; animation-delay: 1s; }
                .neon-line:nth-child(3) { top: 60%; animation-delay: 2s; }
                .neon-line:nth-child(4) { top: 80%; animation-delay: 0.5s; }
                
                @keyframes neon-flow {
                    0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
                    50% { opacity: 1; transform: scaleX(1); }
                }
                
                .login-required-card {
                    background: rgba(26, 26, 46, 0.9);
                    border: 2px solid #00ffff;
                    border-radius: 20px;
                    padding: 3rem 2rem;
                    box-shadow: 
                        0 0 30px rgba(0, 255, 255, 0.3),
                        inset 0 0 30px rgba(0, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    position: relative;
                    overflow: hidden;
                }
                
                .login-required-card::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ffff);
                    border-radius: 20px;
                    z-index: -1;
                    animation: border-glow 3s linear infinite;
                }
                
                @keyframes border-glow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .icon-container {
                    margin-bottom: 2rem;
                }
                
                .lock-icon {
                    font-size: 4rem;
                    color: #00ffff;
                    text-shadow: 0 0 20px #00ffff;
                    animation: pulse 2s ease-in-out infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                h1 {
                    font-family: 'Orbitron', monospace;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    background: linear-gradient(45deg, #00ffff, #ff00ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
                }
                
                .message {
                    font-size: 1.2rem;
                    margin-bottom: 2rem;
                    color: #cccccc;
                    line-height: 1.6;
                }
                
                .login-btn {
                    background: linear-gradient(45deg, #00ffff, #ff00ff);
                    border: none;
                    border-radius: 50px;
                    padding: 1rem 3rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #000;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                }
                
                .login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
                }
                
                .features {
                    margin-top: 2rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
                
                .feature {
                    background: rgba(0, 255, 255, 0.1);
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    border-radius: 10px;
                    padding: 1rem;
                    text-align: center;
                }
                
                .feature-icon {
                    font-size: 2rem;
                    color: #00ffff;
                    margin-bottom: 0.5rem;
                }
                
                .feature-title {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                
                .feature-desc {
                    font-size: 0.9rem;
                    color: #aaaaaa;
                }
                
                @media (max-width: 768px) {
                    .container {
                        padding: 1rem;
                    }
                    
                    h1 {
                        font-size: 2rem;
                    }
                    
                    .message {
                        font-size: 1rem;
                    }
                    
                    .features {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>
        <body>
            <div class="background-animation">
                <div class="grid-overlay"></div>
                <div class="neon-lines">
                    <div class="neon-line"></div>
                    <div class="neon-line"></div>
                    <div class="neon-line"></div>
                    <div class="neon-line"></div>
                </div>
            </div>
            
            <div class="container">
                <div class="login-required-card">
                    <div class="icon-container">
                        <i class="fas fa-lock lock-icon"></i>
                    </div>
                    
                    <h1>LOGIN REQUIRED</h1>
                    
                    <div class="message">
                        You need to be logged in to access this page. Join our community to explore our futuristic streetwear platform!
                    </div>
                    
                    <button class="login-btn" onclick="window.location.href='/?login=required'">
                        <i class="fas fa-sign-in-alt"></i> Login Now
                    </button>
                    
                    <div class="features">
                        <div class="feature">
                            <div class="feature-icon">👕</div>
                            <div class="feature-title">Shop Products</div>
                            <div class="feature-desc">Discover unique streetwear</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">🔄</div>
                            <div class="feature-title">Exchange Hub</div>
                            <div class="feature-desc">Trade with community</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">👥</div>
                            <div class="feature-title">Community</div>
                            <div class="feature-desc">Connect with fashion lovers</div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `);
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // For API routes, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // For page routes, show beautiful login required page
    return res.status(401).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Required - Zippy</title>
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Space Grotesk', sans-serif;
                  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #ffffff;
                  overflow: hidden;
              }
              
              .container {
                  text-align: center;
                  max-width: 600px;
                  padding: 2rem;
                  position: relative;
                  z-index: 2;
              }
              
              .background-animation {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  z-index: 1;
              }
              
              .grid-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-image: 
                      linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
                  background-size: 50px 50px;
                  animation: grid-move 20s linear infinite;
              }
              
              @keyframes grid-move {
                  0% { transform: translate(0, 0); }
                  100% { transform: translate(50px, 50px); }
              }
              
              .neon-lines {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
              }
              
              .neon-line {
                  position: absolute;
                  background: linear-gradient(90deg, transparent, #00ffff, transparent);
                  height: 1px;
                  width: 100%;
                  animation: neon-flow 3s ease-in-out infinite;
              }
              
              .neon-line:nth-child(1) { top: 20%; animation-delay: 0s; }
              .neon-line:nth-child(2) { top: 40%; animation-delay: 1s; }
              .neon-line:nth-child(3) { top: 60%; animation-delay: 2s; }
              .neon-line:nth-child(4) { top: 80%; animation-delay: 0.5s; }
              
              @keyframes neon-flow {
                  0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
                  50% { opacity: 1; transform: scaleX(1); }
              }
              
              .login-required-card {
                  background: rgba(26, 26, 46, 0.9);
                  border: 2px solid #00ffff;
                  border-radius: 20px;
                  padding: 3rem 2rem;
                  box-shadow: 
                      0 0 30px rgba(0, 255, 255, 0.3),
                      inset 0 0 30px rgba(0, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  position: relative;
                  overflow: hidden;
              }
              
              .login-required-card::before {
                  content: '';
                  position: absolute;
                  top: -2px;
                  left: -2px;
                  right: -2px;
                  bottom: -2px;
                  background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ffff);
                  border-radius: 20px;
                  z-index: -1;
                  animation: border-glow 3s linear infinite;
              }
              
              @keyframes border-glow {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }
              
              .icon-container {
                  margin-bottom: 2rem;
              }
              
              .lock-icon {
                  font-size: 4rem;
                  color: #00ffff;
                  text-shadow: 0 0 20px #00ffff;
                  animation: pulse 2s ease-in-out infinite;
              }
              
              @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.1); }
              }
              
              h1 {
                  font-family: 'Orbitron', monospace;
                  font-size: 2.5rem;
                  font-weight: 700;
                  margin-bottom: 1rem;
                  background: linear-gradient(45deg, #00ffff, #ff00ff);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
              }
              
              .message {
                  font-size: 1.2rem;
                  margin-bottom: 2rem;
                  color: #cccccc;
                  line-height: 1.6;
              }
              
              .login-btn {
                  background: linear-gradient(45deg, #00ffff, #ff00ff);
                  border: none;
                  border-radius: 50px;
                  padding: 1rem 3rem;
                  font-size: 1.1rem;
                  font-weight: 600;
                  color: #000;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
              }
              
              .login-btn:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
              }
              
              .features {
                  margin-top: 2rem;
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 1rem;
              }
              
              .feature {
                  background: rgba(0, 255, 255, 0.1);
                  border: 1px solid rgba(0, 255, 255, 0.3);
                  border-radius: 10px;
                  padding: 1rem;
                  text-align: center;
              }
              
              .feature-icon {
                  font-size: 2rem;
                  color: #00ffff;
                  margin-bottom: 0.5rem;
              }
              
              .feature-title {
                  font-weight: 600;
                  margin-bottom: 0.5rem;
              }
              
              .feature-desc {
                  font-size: 0.9rem;
                  color: #aaaaaa;
              }
              
              @media (max-width: 768px) {
                  .container {
                      padding: 1rem;
                  }
                  
                  h1 {
                      font-size: 2rem;
                  }
                  
                  .message {
                      font-size: 1rem;
                  }
                  
                  .features {
                      grid-template-columns: 1fr;
                  }
              }
          </style>
      </head>
      <body>
          <div class="background-animation">
              <div class="grid-overlay"></div>
              <div class="neon-lines">
                  <div class="neon-line"></div>
                  <div class="neon-line"></div>
                  <div class="neon-line"></div>
                  <div class="neon-line"></div>
              </div>
          </div>
          
          <div class="container">
              <div class="login-required-card">
                  <div class="icon-container">
                      <i class="fas fa-lock lock-icon"></i>
                  </div>
                  
                  <h1>LOGIN REQUIRED</h1>
                  
                  <div class="message">
                      You need to be logged in to access this page. Join our community to explore our futuristic streetwear platform!
                  </div>
                  
                  <button class="login-btn" onclick="window.location.href='/?login=required'">
                      <i class="fas fa-sign-in-alt"></i> Login Now
                  </button>
                  
                  <div class="features">
                      <div class="feature">
                          <div class="feature-icon">👕</div>
                          <div class="feature-title">Shop Products</div>
                          <div class="feature-desc">Discover unique streetwear</div>
                      </div>
                      <div class="feature">
                          <div class="feature-icon">🔄</div>
                          <div class="feature-title">Exchange Hub</div>
                          <div class="feature-desc">Trade with community</div>
                      </div>
                      <div class="feature">
                          <div class="feature-icon">👥</div>
                          <div class="feature-title">Community</div>
                          <div class="feature-desc">Connect with fashion lovers</div>
                      </div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `);
  }
};

// Middleware to require admin authentication
const requireAdmin = async (req, res, next) => {
  try {
    const user = await persist.getUserFromToken(req);
    if (!user || user.role !== 'admin') {
      // For API routes, return JSON error
      if (req.path.startsWith('/api/')) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      // For page routes, redirect to login
      return res.redirect('/?login=required');
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    
    // For API routes, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // For page routes, redirect to login
    return res.redirect('/?login=required');
  }
};

// Optional auth middleware - doesn't block but adds user to request if available
const optionalAuth = async (req, res, next) => {
  try {
    const user = await persist.getUserFromToken(req);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth
}; 