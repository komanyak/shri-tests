import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navigation } from '@components/Header/Navigation';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const routerConfig = {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    },
};

describe('Navigation Component', () => {
    it('отображает все навигационные ссылки', () => {
        render(
            <MemoryRouter {...routerConfig}>
                <Navigation />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: /CSV Аналитик/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /CSV Генератор/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /История/i })).toBeInTheDocument();
    });

    it('выделяет активную ссылку на странице анализатора', () => {
        render(
            <MemoryRouter initialEntries={['/']} {...routerConfig}>
                <Navigation />
            </MemoryRouter>
        );

        const analyzerLink = screen.getByRole('link', { name: /CSV Аналитик/i });
        expect(analyzerLink).toHaveAttribute('aria-current', 'page');
    });

    it('выделяет активную ссылку на странице генератора', () => {
        render(
            <MemoryRouter initialEntries={['/generate']} {...routerConfig}>
                <Navigation />
            </MemoryRouter>
        );

        const generatorLink = screen.getByRole('link', { name: /CSV Генератор/i });
        expect(generatorLink).toHaveAttribute('aria-current', 'page');
    });

    it('выделяет активную ссылку на странице истории', () => {
        render(
            <MemoryRouter initialEntries={['/history']} {...routerConfig}>
                <Navigation />
            </MemoryRouter>
        );

        const historyLink = screen.getByRole('link', { name: /История/i });
        expect(historyLink).toHaveAttribute('aria-current', 'page');
    });

    it('переход на страницу анализатора', async () => {
        render(
            <MemoryRouter initialEntries={['/generate']} {...routerConfig}>
                <Navigation />
            </MemoryRouter>
        );

        const analyzerLink = screen.getByRole('link', { name: /CSV Аналитик/i });
        await act(async () => {
            await userEvent.click(analyzerLink);
        });

        expect(analyzerLink).toHaveAttribute('aria-current', 'page');
    });

    it('переход на страницу генератора', async () => {
        render(
            <MemoryRouter initialEntries={['/']} {...routerConfig}>
                <Navigation />
            </MemoryRouter>
        );

        const generatorLink = screen.getByRole('link', { name: /CSV Генератор/i });
        await act(async () => {
            await userEvent.click(generatorLink);
        });

        expect(generatorLink).toHaveAttribute('aria-current', 'page');
    });

    it('переход на страницу анализатора', async () => {
        render(
            <MemoryRouter initialEntries={['/history']} {...routerConfig}>
                <Navigation />
            </MemoryRouter>
        );

        const analyzerLink = screen.getByRole('link', { name: /CSV Аналитик/i });
        await act(async () => {
            await userEvent.click(analyzerLink);
        });

        expect(analyzerLink).toHaveAttribute('aria-current', 'page');
    });
});
