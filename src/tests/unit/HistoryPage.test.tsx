import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPage } from '@pages/History/HistoryPage';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import * as storageUtils from '@utils/storage';

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

jest.mock('@components/HistoryModal', () => ({
    HistoryModal: () => <div data-testid="history-modal" />,
}));

describe('HistoryPage', () => {
    const mockHistoryItems = [
        {
            id: '1',
            fileName: 'report.csv',
            timestamp: Date.now(),
            highlights: { some: 'data' },
        },
        {
            id: '2',
            fileName: 'error.csv',
            timestamp: Date.now() - 100000,
            highlights: null,
        },
    ];

    beforeEach(() => {
        Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockHistoryItems));

        jest.spyOn(storageUtils, 'getHistory').mockReturnValue(mockHistoryItems);
        jest.spyOn(storageUtils, 'removeFromHistory').mockImplementation(jest.fn());
        jest.spyOn(storageUtils, 'clearHistory').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('очищает всю историю при нажатии на кнопку "Очистить историю"', async () => {
        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );

        const clearButton = screen.getByTestId('clear-history-button');
        await userEvent.click(clearButton);

        expect(storageUtils.clearHistory).toHaveBeenCalled();
    });

    it('отображает записи истории при наличии данных', async () => {
        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );

        expect(screen.getByText('report.csv')).toBeInTheDocument();
        expect(screen.getByText('error.csv')).toBeInTheDocument();

        const successStatuses = screen.getAllByText('Обработан успешно');
        expect(successStatuses.length).toBeGreaterThan(0);

        const errorStatuses = screen.getAllByText('Не удалось обработать');
        expect(errorStatuses.length).toBeGreaterThan(0);
    });

    it('удаляет конкретную запись при нажатии на кнопку удаления', async () => {
        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );

        const deleteButtons = screen.getAllByRole('button', { name: /Удалить файл/ });
        expect(deleteButtons.length).toBe(2);

        await userEvent.click(deleteButtons[0]);

        expect(storageUtils.removeFromHistory).toHaveBeenCalledWith('1');
    });

    it('отображает статус "Не удалось обработать" для неуспешных записей', async () => {
        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );

        const errorStatus = screen.getAllByText('Не удалось обработать');
        expect(errorStatus.length).toBeGreaterThan(0);
    });

    it('скрывает кнопку очистки при пустой истории', async () => {
        jest.spyOn(storageUtils, 'getHistory').mockReturnValue([]);

        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );

        expect(screen.queryByTestId('clear-history-button')).not.toBeInTheDocument();
    });
});
