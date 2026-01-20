/**
 * Helper Script: Get YouTube Channel ID
 * 
 * Run this to find the channel ID for Revival Today Church
 */

const YOUTUBE_API_KEY = 'AIzaSyAf8KFT1LO9YOPleEcV05V0iqj1MQom-b4'
const CHANNEL_HANDLE = 'revivaltodaychurch'

async function getChannelId() {
  try {
    console.log('🔍 Searching for channel:', CHANNEL_HANDLE)
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${CHANNEL_HANDLE}&key=${YOUTUBE_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.error) {
      console.error('❌ API Error:', data.error.message)
      return
    }
    
    if (data.items && data.items.length > 0) {
      const channelId = data.items[0].snippet.channelId
      console.log('\n✅ Channel found!')
      console.log('📺 Channel:', data.items[0].snippet.title)
      console.log('🆔 Channel ID:', channelId)
      console.log('\n📋 Add this to your .env.local:')
      console.log(`YOUTUBE_CHANNEL_ID=${channelId}`)
    } else {
      console.log('❌ Channel not found')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

getChannelId()
