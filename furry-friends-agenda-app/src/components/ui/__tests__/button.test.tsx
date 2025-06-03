import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../button'; // Adjust path as necessary

describe('Button component', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>);
        const buttonElement = screen.getByRole('button', { name: /click me/i });
        expect(buttonElement).toBeInTheDocument();
        expect(buttonElement).toHaveClass('bg-primary text-primary-foreground'); // Default variant
        expect(buttonElement).toHaveClass('h-10 px-4 py-2'); // Default size
    });

    it('renders with a specific variant and size', () => {
        render(<Button variant="destructive" size="sm">Delete</Button>);
        const buttonElement = screen.getByRole('button', { name: /delete/i });
        expect(buttonElement).toBeInTheDocument();
        expect(buttonElement).toHaveClass('bg-destructive text-destructive-foreground');
        expect(buttonElement).toHaveClass('h-9 rounded-md px-3');
    });

    it('calls onClick handler when clicked', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        const buttonElement = screen.getByRole('button', { name: /click me/i });
        await userEvent.click(buttonElement);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders as a child component when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/home">Go home</a>
            </Button>
        );
        const linkElement = screen.getByRole('link', { name: /go home/i });
        expect(linkElement).toBeInTheDocument();
        // Check if it has button classes (it should, as per the component logic)
        expect(linkElement).toHaveClass('bg-primary');
        // Check that it's an 'a' tag, not a 'button' tag
        expect(linkElement.tagName).toBe('A');

        // Check that there isn't a button element with the same name (it should have been replaced by the anchor)
        const buttonElement = screen.queryByRole('button', { name: /go home/i });
        expect(buttonElement).not.toBeInTheDocument();
    });

    it('renders with an icon and text', () => {
        const Icon = () => <svg data-testid="icon" />;
        render(<Button> <Icon /> Click me </Button>);
        const buttonElement = screen.getByRole('button', { name: /click me/i });
        expect(buttonElement).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
        // Check for gap class if your cva includes it for children
        expect(buttonElement).toHaveClass('gap-2');
    });

    it('is disabled when disabled prop is true', async () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick} disabled>Click me</Button>);
        const buttonElement = screen.getByRole('button', { name: /click me/i });
        expect(buttonElement).toBeDisabled();
        await userEvent.click(buttonElement);
        expect(handleClick).not.toHaveBeenCalled();
    });
}); 