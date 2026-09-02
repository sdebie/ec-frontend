import {useNavigate, useParams} from 'react-router-dom'
import {
    Alert,
    PageLayout,
    FormPageNotFound,
    PageLoadingSpinner,
    WholesaleApplicationStatusDisplay,
} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {useWholesaleApplicationDetail} from './hooks/useWholesaleApplicationDetail'
import {AddressInformationPanel} from './components/AddressInformationPanel.tsx'
import {ApplicantInformationPanel} from './components/ApplicantInformationPanel.tsx'
import {CompanyInformationPanel} from './components/CompanyInformationPanel.tsx'
import {FinancialInformationPanel} from './components/FinancialInformationPanel.tsx'
import {ApplicationNotesPanel} from './components/ApplicationNotesPanel.tsx'

export function WholesaleApplicationDetailPage() {
    const navigate = useNavigate()
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

    return (
        <PageLayout
            title="Application Details"
            onBack={() => navigate(-1)}
            action={<WholesaleApplicationStatusDisplay status={application.status}/>}
        >
            <div className="flex flex-col gap-6">
                <Alert
                    title="Review before proceeding"
                    description="Please verify all the information below before approving or rejecting this application."
                />

                <Card as="article" variant="panel">
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
        </PageLayout>
    )
}
