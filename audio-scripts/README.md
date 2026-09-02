# Kịch bản audio theo domain

Bốn kịch bản `.txt` là nguồn để tạo các bài nghe trong `public/audio/`.

- Giọng: `vi-VN-HoaiMyNeural`
- Tốc độ: `+12%`
- Đầu ra: MP3, phụ đề SRT từ TTS và WebVTT cho trình duyệt

Ví dụ xuất lại Domain 1:

```powershell
edge-tts `
  --file "audio-scripts/domain-1-secure-architectures.txt" `
  --voice "vi-VN-HoaiMyNeural" `
  --rate "+12%" `
  --write-media "public/audio/domain-1-secure-architectures.mp3" `
  --write-subtitles "public/audio/domain-1-secure-architectures.srt"

ffmpeg -i `
  "public/audio/domain-1-secure-architectures.srt" `
  "public/audio/domain-1-secure-architectures-captions.vtt"
```

Sau khi thay đổi kịch bản, hãy nghe thử phần mở đầu, một đoạn có nhiều tên dịch vụ AWS và phần kết trước khi phát hành.
