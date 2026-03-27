## Simple
sudo npm install -g pm2
pm2 start server.js --name shopping-sync
pm2 save
pm2 startup

## more details

1. Install PM2
---------------
cd ~/Websocket-Relay
npm install -g pm2


2. Start your server with PM2
---------------
pm2 start server.js --name shopping-sync


3. Save the process list
---------------
pm2 save


4. Enable startup on boot
---------------
pm2 startup
# Copy and run the command it shows (something like):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi001 --hp /home/pi001


5. Basic Commands
---------------
Command	What it does
pm2 list	See running processes
pm2 logs shopping-sync	View logs
pm2 restart shopping-sync	Restart
pm2 stop shopping-sync	Stop
pm2 monit	Simple monitor
That's it! Your server will now:

✅ Auto-start on boot

✅ Auto-restart if it crashes

✅ Stay running in background

✅ Log everything

No config files needed. No extra settings. Simple! 🚀




## VERBOSE:

The full chain is:

# pm2 start – start your app

# pm2 save – remember it

# pm2 startup – tell OS to start PM2 on boot