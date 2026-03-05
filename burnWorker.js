// burnWorker.js
importScripts("https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.11/dist/ffmpeg.min.js");

const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

onmessage = async (e) => {
  try {
    const { videoFile, srtText } = e.data;

    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    const videoData = await fetchFile(videoFile);
    const srtData = new Uint8Array(new TextEncoder().encode(srtText));

    ffmpeg.FS('writeFile', 'input.mp4', videoData);
    ffmpeg.FS('writeFile', 'subs.srt', srtData);

    // burn-in subtitles
    await ffmpeg.run(
      '-i','input.mp4',
      '-vf',`subtitles=subs.srt:force_style='FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF&'`,
      'output.mp4'
    );

    const outData = ffmpeg.FS('readFile','output.mp4');
    postMessage({ videoBuffer: outData.buffer }, [outData.buffer]);
  } catch(err){
    postMessage({ error: err.message });
  }
};
