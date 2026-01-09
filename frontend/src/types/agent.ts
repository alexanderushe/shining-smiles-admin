export interface AgentAction {
    id: number;
    agent_name: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'open' | 'resolved' | 'dismissed';
    action_payload: any;
    created_at: string;
}
