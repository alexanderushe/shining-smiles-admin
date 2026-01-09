import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { AgentAction } from '../../types/agent';
import { CheckCircle, XCircle, AlertTriangle, Info, Clock, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function ActionCenter() {
    const [actions, setActions] = useState<AgentAction[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();

    // Filters
    const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [filterAgent, setFilterAgent] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const fetchActions = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8000/api/v1/agents/actions/', {
                headers: { Authorization: `Token ${token}` }
            });
            const openActions = res.data.filter((a: AgentAction) => a.status === 'open');
            setActions(openActions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchActions();
    }, [token]);

    const handleResolve = async (id: number) => {
        try {
            await axios.patch(`http://localhost:8000/api/v1/agents/actions/${id}/`,
                { status: 'resolved' },
                { headers: { Authorization: `Token ${token}` } }
            );
            fetchActions();
        } catch (err) {
            console.error("Failed to resolve", err);
        }
    };

    const handleDismiss = async (id: number) => {
        try {
            await axios.patch(`http://localhost:8000/api/v1/agents/actions/${id}/`,
                { status: 'dismissed' },
                { headers: { Authorization: `Token ${token}` } }
            );
            fetchActions();
        } catch (err) {
            console.error("Failed to dismiss", err);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'high': return 'bg-red-50 text-red-700 ring-red-600/20';
            case 'medium': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
            case 'low': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
        }
    };

    const getIcon = (agent: string) => {
        if (agent.includes('Bursar')) return <span className="text-xl">💰</span>;
        if (agent.includes('Security')) return <span className="text-xl">🛡️</span>;
        if (agent.includes('Guardian')) return <span className="text-xl">🎓</span>;
        return <span className="text-xl">🤖</span>;
    };

    // Filter Logic
    const filteredActions = useMemo(() => {
        return actions.filter(action => {
            if (filterPriority !== 'all' && action.priority !== filterPriority) return false;
            if (filterAgent !== 'all' && action.agent_name !== filterAgent) return false;
            if (searchQuery && !action.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [actions, filterPriority, filterAgent, searchQuery]);

    const uniqueAgents = Array.from(new Set(actions.map(a => a.agent_name)));

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gray-50/50">
            {/* Beta Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                <span className="text-amber-600 text-xl">🚧</span>
                <div>
                    <p className="text-sm font-medium text-amber-800">This feature is in Beta</p>
                    <p className="text-xs text-amber-600">The Action Center is an experimental feature. Some functionality may be incomplete.</p>
                </div>
            </div>

            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Action Center</h1>
                    <p className="text-zinc-500 mt-2">
                        {user?.full_name}, you have <span className="font-semibold text-zinc-900">{actions.length} pending actions</span>.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm flex flex-col items-center">
                        <span className="text-xs text-zinc-500 uppercase font-bold">High</span>
                        <span className="text-xl font-bold text-red-600">
                            {actions.filter(a => a.priority === 'high').length}
                        </span>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm flex flex-col items-center">
                        <span className="text-xs text-zinc-500 uppercase font-bold">Total</span>
                        <span className="text-xl font-bold text-zinc-900">{actions.length}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/90">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>

                    <div className="h-8 w-px bg-zinc-200 mx-2 hidden md:block"></div>

                    <div className="flex bg-zinc-100 p-1 rounded-lg">
                        {['all', 'high', 'medium', 'low'].map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterPriority(p as any)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${filterPriority === p
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={filterAgent}
                        onChange={(e) => setFilterAgent(e.target.value)}
                        className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-black/5"
                    >
                        <option value="all">All Agents</option>
                        {uniqueAgents.map(agent => (
                            <option key={agent} value={agent}>{agent}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto text-zinc-400 mb-4"></div>
                    <p className="text-zinc-400">Syncing with agents...</p>
                </div>
            ) : filteredActions.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-zinc-300 rounded-xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 text-zinc-400 mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900">No actions found</h3>
                    <p className="text-zinc-500 mt-2">Try adjusting your filters or enjoy the break!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredActions.map(action => (
                        <div
                            key={action.id}
                            className={`bg-white border rounded-xl overflow-hidden transition-all hover:shadow-md ${action.priority === 'high' ? 'border-l-4 border-l-red-500' :
                                action.priority === 'medium' ? 'border-l-4 border-l-amber-500' : ''
                                }`}
                        >
                            <div className="p-5 flex flex-col md:flex-row gap-4">
                                {/* Icon */}
                                <div className="flex-shrink-0 pt-1">
                                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                                        {getIcon(action.agent_name)}
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="text-base font-semibold text-zinc-900 truncate pr-2">
                                            {action.title}
                                        </h3>
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(action.priority)} uppercase tracking-wide`}>
                                            {action.priority}
                                        </span>
                                        <span className="text-xs text-zinc-400">
                                            • {action.agent_name}
                                        </span>
                                        <span className="text-xs text-zinc-400">
                                            • {new Date(action.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="text-sm text-zinc-600 line-clamp-2 md:line-clamp-1">
                                        {action.description}
                                    </p>

                                    {/* Action Payload Expand */}
                                    {expandedIds.includes(action.id) && (
                                        <div className="mt-4 bg-zinc-50 rounded-lg p-4 border border-zinc-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <p className="text-sm text-zinc-700 mb-2">{action.description}</p>
                                            <div className="text-xs font-mono text-zinc-500">
                                                <div className="uppercase tracking-wider text-[10px] font-bold text-zinc-400 mb-1">Context Data</div>
                                                <pre className="whitespace-pre-wrap">{JSON.stringify(action.action_payload, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CTAs */}
                                <div className="flex-shrink-0 flex items-start gap-2 pt-1">
                                    <button
                                        onClick={() => toggleExpand(action.id)}
                                        className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-lg transition-colors"
                                        title={expandedIds.includes(action.id) ? "Collapse" : "View Details"}
                                    >
                                        {expandedIds.includes(action.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDismiss(action.id)}
                                        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        onClick={() => handleResolve(action.id)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-sm transition-colors"
                                    >
                                        <CheckCircle size={16} />
                                        <span>Resolve</span>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Actions Footer */}
                            <div className="md:hidden border-t border-zinc-100 bg-zinc-50/50 p-2 flex gap-2">
                                <button
                                    onClick={() => handleDismiss(action.id)}
                                    className="flex-1 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
