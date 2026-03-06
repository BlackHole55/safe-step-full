import { AnswerResponse, SimulationResponse } from '@/types/simulation';
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
});

export const simulationApi = {
    start: async (): Promise<SimulationResponse> => {
        const { data } = await api.post('/simulation/start');
        return data;
    },

    sendAnswer: async (sessionUuid: string, optionId: number): Promise<AnswerResponse> => {
        const { data } = await api.post('/simulation/answer', {
            session_uuid: sessionUuid,
            option_id: optionId
        });
        return data;
    }
}