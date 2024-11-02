"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Lock, Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "@/components/rich-text-editor";
import { BlogPost } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch('/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    };
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "HelloW0rld") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: editingPost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPost ? { ...editingPost, title, content } : { title, content }),
      });

      if (response.ok) {
        const post = await response.json();
        router.push(`/post/${post.id}`);
      }
    } catch (error) {
      console.error("Failed to save post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setShowNewPost(true);
  };

  const handleDelete = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== post.id));
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Link>
          
          <Card className="max-w-md mx-auto">
            <form onSubmit={handleAuth}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Authentication Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={error ? "border-destructive" : ""}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">Access Editor</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    );
  }

  if (!showNewPost) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Button onClick={() => setShowNewPost(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>

          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{post.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setPostToDelete(post);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the post.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => postToDelete && handleDelete(postToDelete)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => {
              setShowNewPost(false);
              setEditingPost(null);
              setTitle("");
              setContent("");
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Button>
        </div>
        
        <Card className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{editingPost ? 'Edit Post' : 'Write a New Post'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingPost ? 'Saving' : 'Publishing'}
                  </>
                ) : (
                  editingPost ? 'Save Changes' : 'Publish'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}