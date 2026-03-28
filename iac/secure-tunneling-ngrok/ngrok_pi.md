## Step 1: Install ngrok on pi:Pi001
`cd ~`
`wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-arm.zip`
`unzip ngrok-stable-linux-arm.zip`
`sudo mv ngrok /usr/local/bin/`





## Step 2: Get your auth token
Go to ngrok.com
Sign up (free)
Get the auth token from dashboard





## Step 3: Configure ngrok
`ngrok authtoken` *NGROK_TOKEN*





## Step 4: Start server and ngrok tunnel
Option A: Simple (run separately)
::::: Terminal 1: Start server
`cd ~/Websocket-Relay`
`node server.js`

::::: Terminal 2: Start ngrok tunnel
`ngrok http 8080`
====================================
Option B: With PM2 (recommended)
::::: Create PM2 config for ngrok
`pm2 start "ngrok http 8080" --name` *NGROK_NAME*
`pm2 save`
`pm2 startup` [PM2 starts automatically when the Pi boots up]





## Step 5: Get the public URL (this will proxy the ip)
After running ngrok, this will show up:

# (1) * * RUN MANUALLY with ngrokk http 8080 ************************
*SSH_1*:~/Websocket-Relay $ `ngrok http 8080`
ngrok                                                                                                                                                                                                                        (Ctrl+C to quit)

🚪 One gateway for every AI model. Available in early access *now*: https://ngrok.com/r/ai

Session Status                online
Account                       MonDc (Plan: Free)
Version                       3.37.3
Region                        United States (us)
Latency                       123ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://*NGROK_URL* -> http://localhost:8080

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00


# (2) * * RUN with pm2 ************************
*SSH_1*:~/Websocket-Relay $ `pm2 start "ngrok http 8080" --name` *NGROK_NAME*
[PM2] Starting /usr/bin/bash in fork_mode (1 instance)
[PM2] Done.
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ event-sourcing-se… │ fork     │ 0    │ online    │ 0%       │ 33.4mb   │
│ 4  │ ngrok-secure-tunn… │ fork     │ 0    │ online    │ 0%       │ 18.3mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
*SSH_1*:~/Websocket-Relay $ `pm2 list`
┌────┬──────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name                     │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼──────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ event-sourcing-server    │ default     │ 1.0.0   │ fork    │ 11540    │ 34h    │ 0    │ online    │ 0%       │ 33.3mb   │ pi001    │ disabled │
│ 4  │ *NGROK_NAME*             │ default     │ N/A     │ fork    │ 14710    │ 68s    │ 0    │ online    │ 0%       │ 28.7mb   │ pi001    │ disabled │
└────┴──────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
*SSH_1*:~/Websocket-Relay $


### EXTRA KNOW_HOW:
```bash
pm2 stop *NGROK_NAME*
pm2 delete *NGROK_NAME*
pm2 logs *NGROK_NAME*
which ngrok
ngrok version
`


========================
### CATCHED-UP AFTER FAILURE:
```bash
[[latest version]]
cd ~ 
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm.zip
unzip -o ngrok-v3-stable-linux-arm.zip
sudo mv ngrok /usr/local/bin/
`


################# MM #################
✅✅✅✅MM1✅✅✅✅
## FLOW
1. Pi boots → ngrok starts → ngrok connects OUTBOUND to ngrok.com (tunnel opens)
2. Pi boots → event-sourcing-server starts → listens on port 8080
3. Browser (Netlify) → connects to wss://xxxx.ngrok.io
4. ngrok.com → forwards that connection DOWN through the tunnel → to your Pi's port 8080
5. event-sourcing-server receives the WebSocket connection → sync works 
✅✅✅✅MM2✅✅✅✅
## SECURE TUNNELING
1. Pi initiates an outbound connection to ngrok.com
2. ngrok.com creates a secure, encrypted tunnel back to your Pi
3. Devices connect to ngrok.com (not directly to your Pi)
5. ngrok.com forwards encrypted traffic through the tunnel to your Pi