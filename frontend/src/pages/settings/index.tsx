import { DashboardHeader } from '../../../components/dashboard-header';
import { CampusManagement } from '../../../components/settings/campus-management';
import { ClassManagement } from '../../../components/settings/class-management';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

export default function SettingsPage() {
    return (
        <div className="p-6">
            <Tabs defaultValue="campuses" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="campuses">Campuses</TabsTrigger>
                    <TabsTrigger value="classes">Classes</TabsTrigger>
                </TabsList>

                <TabsContent value="campuses">
                    <CampusManagement />
                </TabsContent>

                <TabsContent value="classes">
                    <ClassManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
