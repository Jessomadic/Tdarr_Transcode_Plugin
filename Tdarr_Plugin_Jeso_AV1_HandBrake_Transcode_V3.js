/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
/* eslint-disable no-restricted-globals */
const details = () => ({
  id: 'Tdarr_Plugin_Jeso_AV1_HandBrake_Transcode_V3',
  Stage: 'Pre-processing',
  Name: 'AV1 HandBrake Transcoder V3',
  Type: 'Video',
  Operation: 'Transcode',
  Description: 'Transcodes to AV1 at the selected Bitrate. This is best used with Remux Files.',
  Version: '3',
  Tags: 'HandBrake,configurable',

  Inputs: [
    {
      name: 'Encoder',
      type: 'string',
      defaultValue: 'AV1',
      inputUI: {
        type: 'dropdown',
        options: [
          'AV1',
          'AV1 10bit',
          'H.265',
          'H.265 10bit',
          'H.264(GPU)',
          'H.264(CPU)',
          'x265',
          'x265 10bit',
          'x265 12bit',
        ],
      },
      tooltip: `
        ~ Requested Encoder ~ \\n
        Select what encoder you wish to use for transcoding. `,

    },
    {
      name: 'BitRate',
      type: 'string',
      defaultValue: '4000',
      inputUI: {
        type: 'text',
      },
      tooltip: `
        ~ Requested Bitrate ~ \\n
        Put in the Bitrate you want to process to in Kbps. For example 4000Kbps is 4Mbps. `,

    },
    {
      name: 'ResolutionSelection',
      type: 'string',
      defaultValue: '1080p',
      inputUI: {
        type: 'dropdown',
        options: [
          '8KUHD',
          '4KUHD',
          '1080p',
          '720p',
          '480p',
        ],
      },
      // eslint-disable-next-line max-len
      tooltip: 'Any Resolution larger than this will become this Resolution same as the bitrate if the Res is lower than the selected it will use the res of the file as to not cause bloating of file size.',

    },
    {
      name: 'Container',
      type: 'string',
      defaultValue: 'mkv',
      inputUI: {
        type: 'dropdown',
        options: [
          'mp4',
          'mkv',
        ],
      },
      tooltip: ` Container Type \\n\\n
          mkv or mp4.\\n`,
    },
    {
      name: 'AudioType',
      type: 'string',
      defaultValue: 'Flac24',
      inputUI: {
        type: 'dropdown',
        options: [
          'AAC',
          'EAC3',
          'MP3',
          'Vorbis',
          'Flac16',
          'Flac24',
        ],
      },
       //eslint-disable-next-line max-len
      tooltip: 'Set Audio container type that you want to use',

    },
    ],

});
const MediaInfo = {
  videoresolution:'',
  videoHeight: '',
  videoWidth: '',
  videoFPS: '',
  videoBR: '',
}; // var MediaInfo

// Easier for our functions if response has global scope.
const response = {
  processFile: false,
  preset: '',
  container: '',
  handBrakeMode: '',
  FFmpegMode: '',
  reQueueAfter: '',
  infoLog: '',
}; // var response

function getMediaInfo(file) {
  for (let i = 0; i < file.ffProbeData.streams.length; i++) {
    if (file.ffProbeData.streams[i].codec_type.toLowerCase() === 'video') {
//mediainfo.resolution needs to be calulated using MediaInfo.videoheight and MediaInfo.videowidth
      MediaInfo.videoresolution = file.ffProbeData.streams[i].height + 'x' + file.ffProbeData.streams[i].width;
      MediaInfo.videoHeight = Number(file.ffProbeData.streams[i].height);
      MediaInfo.videoWidth = Number(file.ffProbeData.streams[i].width);
      MediaInfo.videoFPS = Number(file.mediaInfo.track[i + 1].FrameRate) || 25;
      MediaInfo.videoBR = (MediaInfo.videoHeight * MediaInfo.videoWidth * MediaInfo.videoFPS * 0.09).toFixed(0);
      break; // Exit the loop once the first video stream is found
    }
  }
}

// eslint-disable-next-line no-unused-vars
const plugin = (file, librarySettings, inputs) => {
  // eslint-disable-next-line no-unused-vars
  const importFresh = require('import-fresh');
  // eslint-disable-next-line no-unused-vars
  const library = importFresh('../methods/library.js');
  // eslint-disable-next-line no-unused-vars
  const lib = require('../methods/lib')();

const SpeedPreset = inputs.SpeedPreset;

const resolutionOrder = ['8KUHD', '4KUHD', '1080p', '720p', '480p'];

  const resolutionsdimensions = {
    '8KUHD': '--width 7680 --height 4320',
    '4KUHD': '--width 3840 --height 2160',
    '1080p': '--width 1920 --height 1080',
    '720p': '--width 1280 --height 720',
    '480p': '--width 640 --height 480',
  };

  const videoResolution = MediaInfo.videoresolution;
  const selectedResolution = inputs.ResolutionSelection;

  const Encoderlist = {
    'AV1': 'svt_av1',
    'AV1 10bit': 'svt_av1_10bit',
    'H.265': 'nvenc_h265',
    'H.265 10bit': 'nvenc_h265_10bit',
    'H.264(GPU)': 'nvenc_h264',
    'H.264(CPU)': 'x264',
    'x265': 'x265',
    'x265 10bit': 'x265_10bit',
    'x265 12bit': 'x265_12bit',
  };

  //Make a Variable for the selected Encoder
  const VarEncoder = inputs.Encoder;

  const Encoder = Encoderlist[VarEncoder]
 
  // make a variable for the dimensions
  const dimensions = resolutionsdimensions[selectedResolution]; 

  //Skip Transcoding if File is already AV1
 // if (file.ffProbeData.streams[0].codec_name === 'av1') {
   // response.processFile = false;
   // response.infoLog += 'File is already AV1 \n';
  //  return response;
//  }
  // eslint-disable-next-line no-constant-condition
  if ((true) || file.forceProcessing === true) {
    // eslint-disable-next-line max-len
    response.preset = `--encoder ${Encoder} -b ${inputs.BitRate} -E ${inputs.AudioType} -f ${inputs.Container} --no-optimize --no-multi-pass ${dimensions} --crop 0:0:0:0`;
    response.container = `.${inputs.Container}`;
    response.handbrakeMode = true;
    response.ffmpegMode = false;
    response.processFile = true;
    response.infoLog += `File is being transcoded at ${inputs.BitRate} Kbps to ${dimensions} as ${inputs.Container} \n`;
    return response;
  }
  };
module.exports.details = details;
module.exports.plugin = plugin;
//svt_av1
//nvenc_h265
//-E ${inputs.AudioType}
// with ${inputs.AudioType}
// --encoder-profile ${SpeedPreset}
