import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from '@pages/Home/HomePage';
import '@testing-library/jest-dom';
import { useAnalysisStore } from '@store/analysisStore';
import { useCsvAnalysis } from '@hooks/use-csv-analysis';
import { addToHistory } from '@utils/storage';

jest.mock('@utils/consts', () => ({
    STORAGE_KEY: 'test-history-key',
    API_HOST: 'http://localhost:3000',
    HIGHLIGHT_TITLES: {
        total_spend_galactic: 'Общие расходы',
        rows_affected: 'Обработано строк',
        less_spent_at: 'День min расходов',
        big_spent_at: 'День max расходов',
        less_spent_value: 'Min расходы в день',
        big_spent_value: 'Max расходы в день',
        average_spend_galactic: 'Средние расходы',
        big_spent_civ: 'Цивилизация max расходов',
        less_spent_civ: 'Цивилизация min расходов',
    },
}));

jest.mock('@store/analysisStore');
jest.mock('@hooks/use-csv-analysis');
jest.mock('@utils/storage');

const mockUseAnalysisStore = useAnalysisStore as jest.MockedFunction<typeof useAnalysisStore>;
const mockUseCsvAnalysis = useCsvAnalysis as jest.MockedFunction<typeof useCsvAnalysis>;
const mockAddToHistory = addToHistory as jest.MockedFunction<typeof addToHistory>;

describe('HomePage', () => {
    const mockSetFile = jest.fn();
    const mockSetStatus = jest.fn();
    const mockSetHighlights = jest.fn();
    const mockReset = jest.fn();
    const mockSetError = jest.fn();
    const mockAnalyzeCsv = jest.fn();

    const defaultState = {
        file: null,
        status: 'idle' as const,
        highlights: [] as any[],
        error: null as string | null,
        setFile: mockSetFile,
        setStatus: mockSetStatus,
        setHighlights: mockSetHighlights,
        reset: mockReset,
        setError: mockSetError,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAnalysisStore.mockReturnValue(defaultState);
        mockUseCsvAnalysis.mockReturnValue({ analyzeCsv: mockAnalyzeCsv });
    });

    it('файл загружается через drag-and-drop', async () => {
        const { rerender } = render(<HomePage />);

        const dropzone = screen.getByText(/или перетащите сюда/i).parentElement!;
        const file = new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' });

        fireEvent.dragEnter(dropzone);
        fireEvent.dragOver(dropzone);
        fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

        expect(mockSetFile).toHaveBeenCalledWith(file);

        mockUseAnalysisStore.mockReturnValue({ ...defaultState, file, status: 'idle' });
        rerender(<HomePage />);

        expect(screen.getByText('test.csv')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Отправить/i })).toBeInTheDocument();
    });

    it('файл загружается через через кнопку загрузки', async () => {
        const user = userEvent.setup();
        const { container, rerender } = render(<HomePage />);

        const uploadInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['x,y\n3,4'], 'btn.csv', { type: 'text/csv' });

        await user.upload(uploadInput, file);
        expect(mockSetFile).toHaveBeenCalledWith(file);

        mockUseAnalysisStore.mockReturnValue({ ...defaultState, file, status: 'idle' });
        rerender(<HomePage />);
        expect(screen.getByText('btn.csv')).toBeInTheDocument();
    });

    it('состояние страницы сбрасывается при клике на крестик', async () => {
        const user = userEvent.setup();
        const file = new File([''], 'test.csv', { type: 'text/csv' });

        mockUseAnalysisStore.mockReturnValue({ ...defaultState, file, status: 'idle' });
        const { rerender } = render(<HomePage />);

        const clearBtn = screen.getAllByRole('button').find((btn) => btn.textContent === '')!;
        await user.click(clearBtn);

        expect(mockReset).toHaveBeenCalled();

        mockUseAnalysisStore.mockReturnValue(defaultState);
        rerender(<HomePage />);
        expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
    });

    it('при клике на "Отправить" меняется статус', async () => {
        const user = userEvent.setup();
        const file = new File([''], 'send.csv', { type: 'text/csv' });
        mockUseAnalysisStore.mockReturnValue({ ...defaultState, file, status: 'idle' });

        render(<HomePage />);
        const sendBtn = screen.getByRole('button', { name: /Отправить/i });
        await user.click(sendBtn);

        expect(mockSetStatus).toHaveBeenCalledWith('processing');
        expect(mockAnalyzeCsv).toHaveBeenCalledWith(file);
    });

    it('во время парсинга файла отображается соответствующая надпись', () => {
        const file = new File([''], 'x.csv', { type: 'text/csv' });
        mockUseAnalysisStore.mockReturnValue({ ...defaultState, file, status: 'processing' });
        render(<HomePage />);
        expect(screen.getByText(/идёт парсинг файла/i)).toBeInTheDocument();
    });

    it('при ошибке анализа ошибка сохраняется в историю', async () => {
        const errorMessage = 'Network Error';
        mockUseCsvAnalysis.mockImplementation(({ onError }) => ({
            analyzeCsv: async () => {
                onError(new Error(errorMessage));
            },
        }));

        const user = userEvent.setup();
        const file = new File([''], 'err.csv', { type: 'text/csv' });
        mockUseAnalysisStore.mockReturnValue({ ...defaultState, file, status: 'idle' });

        render(<HomePage />);
        await user.click(screen.getByRole('button', { name: /Отправить/i }));

        await waitFor(() => {
            expect(mockSetError).toHaveBeenCalledWith(errorMessage);
        });
        expect(mockAddToHistory).toHaveBeenCalledWith({ fileName: 'err.csv' });
    });

    it('отображаются хайлайты', () => {
        const file = new File([''], 'ok.csv', { type: 'text/csv' });
        const highlights = [
            { title: 'Общие расходы', value: '100', description: '...' },
            { title: 'Средние расходы', value: '50', description: '...' },
        ];
        mockUseAnalysisStore.mockReturnValue({
            ...defaultState,
            file,
            status: 'completed',
            highlights,
        });

        render(<HomePage />);
        highlights.forEach((h) => {
            expect(screen.getByText(h.title)).toBeInTheDocument();
        });
    });
});
