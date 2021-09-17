const fs = require('fs');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const settings = require('./settings.json');

var processing = 0;
var index = 0;
const list = fs.readdirSync(settings.inputPath);

function process(i) {
	var processor = ffmpeg();
	processor.input(path.join(settings.inputPath, list[i]))
		.output(path.join(settings.outputPath, list[i].replace(/\.[^/.]+$/, "") + settings.outputExt))
		.on('start', () => {
			console.log('Started processing file: ' + list[i])
		})
		.on('end', () => {
			console.log('Finished processing file: ' + list[i]);
			processing--;
			queue();
		})
		.on('error', (error) => {
			console.log(error);
			processing--;
			queue();
		})

	if (settings.args !== "") {
		processor.audioFilters(settings.args);
	}
	if (settings.codec !== "") {
		processor.audioCodec(settings.codec)
	}
	if (settings.bitrate !== "") {
		processor.audioBitrate(settings.bitrate)
	}

	processor.run();
}

function queue() {
	if (!settings.test) {
		while (processing < settings.maxParallel && index < list.length) {
			process(index);
			processing++;
			index++;
		}
	}
}
if (settings.test) {
	process(0);
} else {
	queue();
}