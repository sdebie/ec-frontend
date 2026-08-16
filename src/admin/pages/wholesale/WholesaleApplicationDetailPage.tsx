import {useParams} from 'react-router-dom'
import {Alert, FormPageLayout, FormPageNotFound, PageLoadingSpinner, StatusBadge} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {useWholesaleApplicationDetail} from './hooks'
import {resolveApplicationStatusConfig} from './components/applicationStatus.ts'
import {AddressInformationPanel} from './components/AddressInformationPanel.tsx'
import {ApplicantInformationPanel} from './components/ApplicantInformationPanel.tsx'
import {CompanyInformationPanel} from "@/admin/pages/wholesale/components/CompanyInformationPanel.tsx";
import {FinancialInformationPanel} from "@/admin/pages/wholesale/components/FinancialInformationPanel.tsx";
import {ApplicationNotesPanel} from "@/admin/pages/wholesale/components/ApplicationNotesPanel.tsx";

export function WholesaleApplicationDetailPage() {
    const {applicationId} = useParams<{ applicationId: string }>()
    const {data, isLoading} = useWholesaleApplicationDetail(applicationId!)

    if (isLoading) {
        return <PageLoadingSpinner/>
    }

    if (!data) {
        return (
            <FormPageNotFound
                entityName="Application"
                backHref="/admin/wholesale"
                backLabel="Back to wholesale applications"
            />
        )
    }

    const application = data
    const statusConfig = resolveApplicationStatusConfig(application.status)

    return (
        <FormPageLayout
            title="Application Details"
            action={<StatusBadge label={statusConfig.label} color={statusConfig.color}/>}
        >
            <div className="flex flex-col gap-6">
                <Alert
                    title="Review before proceeding"
                    description="Please verify all the information below before approving or rejecting this application."
                />

                <Card as="article" elevation="sm" padded={false}>
                    <Card.Body className="flex flex-col gap-6 p-5">
                        <ApplicantInformationPanel
                            application={application}
                        />
                        <CompanyInformationPanel
                            application={application}
                        />
                        <AddressInformationPanel
                            application={application}
                        />
                        <FinancialInformationPanel
                            application={application}
                        />
                        <ApplicationNotesPanel
                            application={application}
                        />
                    </Card.Body>
                </Card>
            </div>
        </FormPageLayout>
    )
}
