import fs from 'fs';
import path from 'path';
import { BlogPost } from './types';

const postsDirectory = path.join(process.cwd(), 'data/posts');

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter(fileName => fileName.endsWith('.json'))
    .map(fileName => {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const post = JSON.parse(fileContents);
      return post;
    })
    .sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

  return posts;
}

export function getPost(id: string): BlogPost | null {
  const fullPath = path.join(postsDirectory, `${id}.json`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(fileContents);
}

export function savePost(post: { title: string; content: string }): BlogPost {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }

  const id = Date.now().toString();
  const excerpt = post.content
    .replace(/<[^>]*>/g, '')
    .slice(0, 150) + (post.content.length > 150 ? '...' : '');
  
  const blogPost: BlogPost = {
    id,
    title: post.title,
    content: post.content,
    excerpt,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(postsDirectory, `${id}.json`),
    JSON.stringify(blogPost, null, 2)
  );

  return blogPost;
}

export function updatePost(id: string, post: { title: string; content: string }): BlogPost | null {
  const fullPath = path.join(postsDirectory, `${id}.json`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const excerpt = post.content
    .replace(/<[^>]*>/g, '')
    .slice(0, 150) + (post.content.length > 150 ? '...' : '');

  const existingPost = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const updatedPost: BlogPost = {
    ...existingPost,
    title: post.title,
    content: post.content,
    excerpt,
  };

  fs.writeFileSync(fullPath, JSON.stringify(updatedPost, null, 2));
  return updatedPost;
}

export function deletePost(id: string): boolean {
  const fullPath = path.join(postsDirectory, `${id}.json`);
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  fs.unlinkSync(fullPath);
  return true;
}