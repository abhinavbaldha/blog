import { getAllPosts } from '@/lib/blog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 text-transparent bg-clip-text mb-8">
          My Blog
        </h1>

        {posts.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <p className="text-muted-foreground">No posts yet.</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle className="text-2xl">{post.title}</CardTitle>
                      <CardDescription>
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="text-muted-foreground line-clamp-3 prose dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: post.excerpt }}
                      />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </main>
  );
}