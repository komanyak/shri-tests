import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GeneratePage } from '@pages/Generate/GeneratePage';
import '@testing-library/jest-dom';

global.fetch = jest.fn() as jest.Mock;

jest.mock('@utils/consts', () => ({
    API_HOST: 'http://localhost:3000',
}));

jest.mock('@ui/Loader', () => ({
    Loader: () => <div data-testid="loader">Loader</div>,
}));

describe('GeneratePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('отправляет запрос на генерацию при клике', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            headers: { get: () => 'attachment; filename="report.csv"' },
            blob: () => Promise.resolve(new Blob()),
        });

        render(<GeneratePage />);

        await userEvent.click(screen.getByText('Начать генерацию'));

        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/report?size=0.01', {
            method: 'GET',
        });
    });

    it('отображает лоадер во время генерации', async () => {
        let resolveFetch: (value: any) => void;
        const fetchPromise = new Promise((resolve) => {
            resolveFetch = resolve;
        });

        (fetch as jest.Mock).mockImplementation(() => fetchPromise);

        render(<GeneratePage />);

        await userEvent.click(screen.getByText('Начать генерацию'));

        expect(screen.getByTestId('loader')).toBeInTheDocument();

        resolveFetch!({
            ok: true,
            headers: { get: () => 'attachment; filename="report.csv"' },
            blob: () => Promise.resolve(new Blob()),
        });

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });
    });

    it('показывает сообщение об ошибке при неудачной генерации', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

        render(<GeneratePage />);

        await userEvent.click(screen.getByText('Начать генерацию'));

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
        });
    });
    it('при успешной генерации показывает сообщение', async () => {
        const mockCreateObjectURL = jest.fn(() => 'blob:test');
        const mockRevokeObjectURL = jest.fn();
        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            headers: { get: () => 'attachment; filename="report.csv"' },
            blob: () => Promise.resolve(new Blob()),
        });

        render(<GeneratePage />);

        const button = screen.getByText('Начать генерацию');
        await userEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Отчёт успешно сгенерирован!')).toBeInTheDocument();
            expect(screen.getByText('Начать генерацию')).toBeInTheDocument();
        });
    });
});
