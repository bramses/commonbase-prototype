import fs from 'fs';
import path from 'path';
import { addRecord } from '../../src/index';

const FILENAME = 'seed-tweets.json';

const seedTweets = async () => {
    const data
        = fs.readFileSync(path.join(__dirname, 'data', FILENAME), 'utf8');
    const tweets = JSON.parse(data);

    for (const tweet of tweets) {
        if (isShortenedTwitterUrl(tweet.full_text)) {
            console.log('Skipping tweet with shortened URL:', tweet.full_text);
            continue;
        }
        const { data, metadata } = extractDataAndMetadata(tweet);
        console.log(data);
        console.log(metadata);
        await addRecord(data, metadata, true);
    }
}


const extractDataAndMetadata = (tweet: any) => {
    // data and metadata are above as [d] and [m] respectively
    const data = tweet.full_text;
    let media_url = null;
    if (tweet.metadata.legacy.entities.media) {
        media_url = tweet.metadata.legacy.entities.media[0].media_url_https;
    }
    const metadata = {
        screen_name: tweet.screen_name,
        name: tweet.name,
        url: tweet.url,
        media_url: media_url,
    };

    return { data, metadata };
}

seedTweets();

function isShortenedTwitterUrl(text: string) {
    const twitterShortUrlPattern = /^https:\/\/t\.co\/[a-zA-Z0-9]+$/;
    return twitterShortUrlPattern.test(text);
}
