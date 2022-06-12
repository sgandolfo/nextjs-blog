import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostData() {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postDirectory);
    const allPostsData = fileNames.map((fileName) => {
        //remove md from file name to get id
        const id = fileName.replace(/\.md/,'');

        //Read markdown file as a string
        const fullPath = path.join(postDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf-8');

        //Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        //Combine the data with an id
        return {
            id,
            ...matterResult.data
        }
    });

    //Sorts posts by date
    return allPostsData.sort(({date:a}, {date:b}) => {
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        } else {
            return 0;
        }
    });
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postDirectory);

    return fileNames.map((fileName) => {
        return {
            params: {
                id: fileName.replace(/\.md/,''),
            },
        };
    });
}

export async function getPostData(id) {
    const fullPath = path.join(postDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        id,
        contentHtml,
        ...matterResult.data
    };
};