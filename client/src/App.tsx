import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/hooks/use-theme';
import Home from '@/pages/Home';
import Landing from '@/pages/Landing';
import Signup from '@/pages/Signup';
import Login from '@/pages/Login';
import Account from '@/pages/Account';
import Subscribe from '@/pages/Subscribe';
import BlogPost from '@/pages/BlogPost';
import NotFound from '@/pages/not-found';

function Router() {
	return (
		<Switch>
			<Route path='/' component={Home} />
			<Route path='/home' component={Landing} />
			<Route path='/signup' component={Signup} />
			<Route path='/login' component={Login} />
			<Route path='/account' component={Account} />
			<Route path='/subscribe' component={Subscribe} />
			<Route path='/blog/:slug' component={BlogPost} />
			<Route component={NotFound} />
		</Switch>
	);
}

function App() {
	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<TooltipProvider>
					<Toaster />
					<Router />
				</TooltipProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}

export default App;
