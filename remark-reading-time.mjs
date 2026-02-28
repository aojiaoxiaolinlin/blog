import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
    return function (tree, { data }) {
        const textOnPage = toString(tree);
        const readingTime = getReadingTime(textOnPage);
        // readingTime.text 会以友好的字符串形式给出阅读时间，例如 "3 min read"。
        // 我们只需分钟数，可以使用 readingTime.minutes
        data.astro.frontmatter.minutesRead = Math.ceil(readingTime.minutes);
    };
}
