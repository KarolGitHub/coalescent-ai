import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { File, UsersRound, LayoutPanelLeft } from 'lucide-react';

export default function HomePage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[70vh] gap-8'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold mb-2'>Welcome to Coalescent AI</h1>
        <p className='text-lg text-muted-foreground max-w-xl mx-auto'>
          Your AI-powered team collaboration hub. Manage tickets, customers, and
          collaborate in real time on a whiteboard—all in one place.
        </p>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl'>
        <Card className='flex flex-col items-center p-6'>
          <CardHeader className='flex flex-col items-center'>
            <File className='w-10 h-10 mb-2 text-primary' />
            <CardTitle>Tickets</CardTitle>
            <CardDescription>
              Track and manage your team's tasks and support tickets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className='w-full'>
              <Link href='/tickets'>Go to Tickets</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className='flex flex-col items-center p-6'>
          <CardHeader className='flex flex-col items-center'>
            <UsersRound className='w-10 h-10 mb-2 text-primary' />
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              View and manage your customer relationships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className='w-full'>
              <Link href='/customers'>Go to Customers</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className='flex flex-col items-center p-6'>
          <CardHeader className='flex flex-col items-center'>
            <LayoutPanelLeft className='w-10 h-10 mb-2 text-primary' />
            <CardTitle>Whiteboard</CardTitle>
            <CardDescription>
              Collaborate visually with your team in real time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className='w-full'>
              <Link href='/whiteboard/test'>Open Whiteboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
