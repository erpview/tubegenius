# 📝 Transcript Feature Implementation Plan

## 🎯 Goal
Add automatic transcript generation when users download videos. Users can view, copy, and download transcripts as `.txt` files.

---

## 🏗️ Architecture

### **Phase 1: Extract YouTube Captions (Easy - Implement First)** ⭐
- Use `yt-dlp` to extract existing YouTube captions/subtitles
- Works for ~80% of videos that have captions
- Fast and free
- No additional API costs

### **Phase 2: AI Speech-to-Text (Advanced - Future Enhancement)**
- Use Whisper AI for videos without captions
- Requires more processing power
- Consider using external API (AssemblyAI, Deepgram, etc.)

---

## 📦 Implementation Steps

### **Backend Changes:**

#### 1. Update `server.js` - Add Transcript Extraction
```javascript
// Add after video download completes
const transcriptPath = path.resolve(__dirname, 'downloads', `${jobId}.txt`);

// Extract subtitles/captions
const transcriptArgs = [
  url,
  '--write-auto-sub',  // Auto-generated captions
  '--write-sub',       // Manual captions (preferred)
  '--sub-lang', 'en',  // English (can make configurable)
  '--skip-download',   // Don't download video again
  '--convert-subs', 'txt',  // Convert to plain text
  '-o', transcriptPath.replace('.txt', '')
];

// Run yt-dlp to extract transcript
const transcriptProcess = spawn('yt-dlp', transcriptArgs);
```

#### 2. Add New Socket Event
```javascript
// Emit transcript when ready
socket.emit('transcript-ready', {
  transcriptUrl: `/downloads/${jobId}.txt`,
  transcriptText: fs.readFileSync(transcriptPath, 'utf-8')
});
```

#### 3. Update Download Endpoint
```javascript
// Serve transcript files
app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'downloads', filename);
  
  // Set appropriate headers based on file type
  if (filename.endsWith('.txt')) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
  }
  
  res.sendFile(filePath);
});
```

---

### **Frontend Changes:**

#### 1. Create `TranscriptViewer.tsx` Component
```typescript
interface TranscriptViewerProps {
  transcript: string;
  transcriptUrl: string;
  videoTitle: string;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  transcriptUrl,
  videoTitle
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
      <h3>📝 Transcript</h3>
      <div className="transcript-box">
        <pre>{transcript}</pre>
      </div>
      <div className="buttons">
        <button onClick={handleCopy}>
          {copied ? '✅ Copied!' : '📋 Copy Transcript'}
        </button>
        <a href={transcriptUrl} download>
          📥 Download .txt
        </a>
      </div>
    </div>
  );
};
```

#### 2. Update `types.ts`
```typescript
export interface BackendProcessStatus {
  stage: ProcessStage;
  progress: number;
  message: string;
  transcript?: string;        // Add transcript text
  transcriptUrl?: string;     // Add transcript download URL
}
```

#### 3. Update `mockBackendService.ts`
```typescript
// Listen for transcript-ready event
this.socket.on('transcript-ready', (data) => {
  onUpdate({
    stage: 'COMPLETE',
    progress: 100,
    message: 'Transcript generated!',
    transcript: data.transcriptText,
    transcriptUrl: data.transcriptUrl
  });
});
```

#### 4. Update `DownloadOptions.tsx`
```typescript
// Add state for transcript
const [transcript, setTranscript] = useState<string | null>(null);
const [transcriptUrl, setTranscriptUrl] = useState<string | null>(null);

// Update when status changes
useEffect(() => {
  if (status?.transcript) {
    setTranscript(status.transcript);
    setTranscriptUrl(status.transcriptUrl || null);
  }
}, [status]);

// Render transcript viewer if available
{transcript && (
  <TranscriptViewer
    transcript={transcript}
    transcriptUrl={transcriptUrl!}
    videoTitle={metadata.title}
  />
)}
```

---

## 🎨 UI Design

### **Transcript Display:**
- Collapsible section below download options
- Light text on dark background (matches theme)
- Monospace font for readability
- Max height with scroll
- Copy button with success feedback
- Download button

### **Visual Flow:**
```
1. User clicks "Download"
2. Progress bar shows: "Downloading video..."
3. Progress bar shows: "Extracting transcript..."
4. Video downloads to computer
5. Transcript appears below with "Copy" and "Download" buttons
```

---

## ⚠️ Edge Cases to Handle

### **No Captions Available:**
- Show message: "No transcript available for this video"
- Offer option to generate with AI (future feature)

### **Non-English Videos:**
- Add language selector
- Support multiple languages: `--sub-lang en,es,fr,de`

### **Large Transcripts:**
- Limit display to first 500 lines
- Add "Show More" button
- Always allow full download

---

## 🚀 Deployment Considerations

### **Railway:**
- ✅ yt-dlp already installed
- ✅ No additional dependencies needed
- ⚠️ Transcript files will use storage (clean up old files)

### **Storage Management:**
- Delete transcript files after 1 hour
- Add cleanup cron job

---

## 📊 Testing Plan

### **Test Videos:**
1. **With Captions:** `https://www.youtube.com/watch?v=9bZkp7q19f0` (Gangnam Style)
2. **Auto-Generated:** Most tech tutorials
3. **No Captions:** Music videos without lyrics

---

## 🎯 Success Metrics

- ✅ Transcript extracted for videos with captions
- ✅ Transcript displayed in UI
- ✅ Copy to clipboard works
- ✅ Download .txt file works
- ✅ Clean error message when no captions available

---

## 🔮 Future Enhancements (Phase 2)

### **AI Speech-to-Text:**
- Integrate Whisper AI for videos without captions
- Use AssemblyAI or Deepgram API
- Add language detection
- Add speaker diarization (who said what)

### **Advanced Features:**
- Timestamp links (click to jump to video time)
- Search within transcript
- Highlight keywords
- Export to different formats (SRT, VTT, JSON)
- Translation to other languages

---

## 💰 Cost Analysis

### **Phase 1 (YouTube Captions):**
- **Cost:** $0 (uses existing yt-dlp)
- **Processing Time:** +2-5 seconds
- **Success Rate:** ~80% of videos

### **Phase 2 (AI Speech-to-Text):**
- **AssemblyAI:** $0.00025/second (~$0.15 for 10min video)
- **Deepgram:** $0.0043/minute (~$0.043 for 10min video)
- **Whisper (self-hosted):** Free but requires GPU
- **Processing Time:** +30-60 seconds

---

## ✅ Ready to Implement?

**Start with Phase 1** - YouTube captions extraction. This will work for most videos and requires no additional costs or APIs.

**Next Steps:**
1. Update `server.js` to extract captions
2. Create `TranscriptViewer.tsx` component
3. Update types and services
4. Test with various videos
5. Deploy to Railway

Let me know when you're ready to start coding! 🚀
