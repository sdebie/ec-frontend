import {Search, Mail, User, MoreVertical, Plus, CheckCircle2, XCircle, AlertTriangle, Info, Download, Upload} from 'lucide-react';
import * as React from 'react';

import {
    Button,
    InputField,
    Menu,
    MenuItem,
    MenuList,
    MenuSection,
    MenuSeparator,
    MenuTrigger,
    PageLayout,
    Select
} from "@/components";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import {Dialog, DialogContent, DialogFooter, DialogHeader} from "@/components/shared/dialog/Dialog.tsx";
import {Drawer, DrawerContent, DrawerFooter, DrawerHeader} from "@/components/shared/drawer/Drawer.tsx";
import {toast} from '@/components/shared/toast';
import MixedFormControls from "@/pages/shared/demo/MixedFormControls.tsx";
import {Card} from '@/primitives/card';

const ComponentsDemo = () => {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

    const data = [
        {id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin'},
        {id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor'},
        {id: 3, name: 'Mike Ross', email: 'mike@example.com', role: 'Viewer'},
        {id: 4, name: 'John Doe', email: 'john@example.com', role: 'Admin'},
        {id: 5, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor'},
        {id: 6, name: 'Mike Ross', email: 'mike@example.com', role: 'Viewer'},
        {id: 7, name: 'John Doe', email: 'john@example.com', role: 'Admin'},
        {id: 8, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor'},
        {id: 9, name: 'Mike Ross', email: 'mike@example.com', role: 'Viewer'},
        {id: 10, name: 'John Doe', email: 'john@example.com', role: 'Admin'},
        {id: 11, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor'},
        {id: 12, name: 'Mike Ross', email: 'mike@example.com', role: 'Viewer'}
    ];

    // type UserRow = typeof data[0];

    const columns = [
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
        },
        {
            id: 'email',
            accessorKey: 'email',
            header: 'Email',
            enableSorting: true,
        },
        {
            id: 'role',
            accessorKey: 'role',
            header: 'Role',
            enableSorting: true,
        },
        {
            id: 'actions',
            label: 'Actions',
            sortable: false,
            cell: () => (
                <Menu>
                    <MenuTrigger><Button variant="ghost" size="sm"
                                         leftIcon={<MoreVertical className="w-4 h-4"/>}>Actions</Button></MenuTrigger>
                    <MenuList>
                        <MenuItem>Edit User</MenuItem>
                        <MenuItem>View Profile</MenuItem>
                        <MenuSeparator/>
                        <MenuItem className="text-red-500">Delete User</MenuItem>
                    </MenuList>
                </Menu>
            )
        }
    ];

    return (
        <PageLayout
            title="UI Components Sandbox"
            description="Interactive preview of all reusable, theme-aware components."
        >
            <div className="grid gap-12 max-w-5xl pb-20">

                {/* Buttons */}
                <section className="space-y-6">
                    <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">Buttons</h2>

                    {/* All variants */}
                    <Card>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-admin-text">Variants — visual hierarchy</p>
                            <p className="text-xs text-admin-text-muted">
                                Six variants ordered from highest to lowest visual weight. Use the hierarchy to
                                communicate action priority — one <strong>solid</strong> per toolbar, supporting
                                actions as <strong>secondary</strong> or <strong>outline</strong>, low-priority
                                utilities as <strong>ghost</strong> or <strong>neutral</strong>, and inline
                                text links as <strong>plain</strong>.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button variant="solid">Solid</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="secondary">Neutral</Button>
                                <Button variant="plain">Plain</Button>
                            </div>
                        </div>
                    </Card>

                    {/* States per variant */}
                    <Card>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-admin-text">States — disabled & loading</p>
                            <p className="text-xs text-admin-text-muted">
                                All variants share the same disabled (50 % opacity, pointer-events off) and loading
                                (spinner) behaviour.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button variant="solid" disabled>Solid disabled</Button>
                                <Button variant="secondary" disabled>Secondary disabled</Button>
                                <Button variant="outline" disabled>Outline disabled</Button>
                                <Button variant="ghost" disabled>Ghost disabled</Button>
                                <Button variant="secondary" disabled>Neutral disabled</Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button variant="solid" loading>Saving…</Button>
                                <Button variant="secondary" loading>Importing…</Button>
                                <Button variant="outline" loading>Exporting…</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Sizes */}
                    <Card>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-admin-text">Sizes</p>
                            <p className="text-xs text-admin-text-muted">
                                Three sizes apply equally across all variants.
                            </p>
                            <div className="flex flex-wrap items-end gap-3 pt-1">
                                <Button variant="solid" size="sm">Small</Button>
                                <Button variant="solid" size="md">Medium</Button>
                                <Button variant="solid" size="lg">Large</Button>
                                <Button variant="secondary" size="sm">Small</Button>
                                <Button variant="secondary" size="md">Medium</Button>
                                <Button variant="secondary" size="lg">Large</Button>
                            </div>
                        </div>
                    </Card>

                    {/* With icons */}
                    <Card>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-admin-text">With icons</p>
                            <p className="text-xs text-admin-text-muted">
                                Use <code className="text-primary font-mono">leftIcon</code> or <code className="text-primary font-mono">rightIcon</code> on any variant.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button variant="solid" leftIcon={<Plus className="w-4 h-4"/>}>Create Brand</Button>
                                <Button variant="secondary" leftIcon={<Download className="w-4 h-4"/>}>Import</Button>
                                <Button variant="outline" leftIcon={<Upload className="w-4 h-4"/>}>Export</Button>
                                <Button variant="ghost" leftIcon={<Search className="w-4 h-4"/>}>Search</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Real-world example: Brands toolbar */}
                    <Card>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-admin-text">Real-world example — Brands toolbar</p>
                            <p className="text-xs text-admin-text-muted">
                                One primary action at the far right, a medium-emphasis secondary for Import, and a
                                low-emphasis outline for Export. The eye moves naturally left-to-right toward the
                                strongest signal.
                            </p>
                            <div className="flex items-center justify-between rounded-md border border-admin-border bg-admin-bg px-4 py-3 pt-4">
                                <p className="text-sm font-medium text-admin-text">Brands</p>
                                <div className="flex items-center gap-2">
                                    <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4"/>}>Import</Button>
                                    <Button variant="outline" size="sm" leftIcon={<Upload className="w-4 h-4"/>}>Export</Button>
                                    <Button variant="solid" size="sm" leftIcon={<Plus className="w-4 h-4"/>}>Create Brand</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Form Inputs & Select */}
                <Card>
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">
                            Form Elements
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <InputField
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    leftIcon={<Mail className="w-4 h-4"/>}
                                    required
                                />
                                <InputField
                                    label="Username"
                                    placeholder="Choose a username"
                                    leftIcon={<User className="w-4 h-4"/>}
                                    helperText="Must be unique across the system."
                                />
                                <InputField
                                    label="Password"
                                    type="password"
                                    error="Password must be at least 8 characters."
                                />
                            </div>
                            <div className="space-y-4">
                                <Select
                                    label="User Role"
                                    required
                                    options={[
                                        {value: 'admin', label: 'Administrator'},
                                        {value: 'editor', label: 'Editor'},
                                        {value: 'viewer', label: 'Viewer'},
                                        {value: 'banned', label: 'Banned User', disabled: true},
                                    ]}
                                />
                                <Select
                                    label="Status"
                                    helperText="Select the initial state of the dataset."
                                    options={[
                                        {value: 'active', label: 'Active'},
                                        {value: 'inactive', label: 'Inactive'},
                                    ]}
                                />
                            </div>
                        </div>
                    </section>
                </Card>

                {/* Data Table */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">
                        Data Table
                    </h2>
                    <DataTable
                        columns={columns}
                        data={data}
                        initialPageSize={3}
                    />
                </section>

                {/* Mixed Form Controls */}
                <section className="space-y-4">
                    <MixedFormControls/>
                </section>

                {/* Toast Notifications */}
                <section className="space-y-6">
                    <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">
                        Toast Notifications
                    </h2>

                    {/* Variants */}
                    <Card>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-admin-text">Variants</p>
                            <p className="text-xs text-admin-text-muted">
                                Each variant uses a distinct colour accent and icon. Success, info, and warning
                                auto-dismiss; error toasts are persistent until manually closed.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-1">
                                <Button
                                    variant="solid"
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    leftIcon={<CheckCircle2 className="w-4 h-4"/>}
                                    onClick={() => toast.success('Brand updated successfully!')}
                                >
                                    Success
                                </Button>
                                <Button
                                    variant="solid"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700"
                                    leftIcon={<XCircle className="w-4 h-4"/>}
                                    onClick={() => toast.error("We couldn't complete that request. Please try again.")}
                                >
                                    Error
                                </Button>
                                <Button
                                    variant="solid"
                                    size="sm"
                                    className="bg-amber-500 hover:bg-amber-600"
                                    leftIcon={<AlertTriangle className="w-4 h-4"/>}
                                    onClick={() => toast.warning('Your session will expire in 5 minutes.')}
                                >
                                    Warning
                                </Button>
                                <Button
                                    variant="solid"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    leftIcon={<Info className="w-4 h-4"/>}
                                    onClick={() => toast.info('A new version of the app is available.')}
                                >
                                    Info
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* With title */}
                    <Card>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-admin-text">With title</p>
                            <p className="text-xs text-admin-text-muted">
                                Pass a <code className="text-primary font-mono">title</code> option to add a bold
                                heading above the message body.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border"
                                    leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-500"/>}
                                    onClick={() =>
                                        toast.success('The product catalogue has been refreshed.', {
                                            title: 'Sync complete',
                                        })
                                    }
                                >
                                    Success + title
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border"
                                    leftIcon={<XCircle className="w-4 h-4 text-red-500"/>}
                                    onClick={() =>
                                        toast.error('The server returned a 500 error. Check the logs for details.', {
                                            title: 'API request failed',
                                        })
                                    }
                                >
                                    Error + title
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border"
                                    leftIcon={<AlertTriangle className="w-4 h-4 text-amber-500"/>}
                                    onClick={() =>
                                        toast.warning('Bulk deleting products cannot be undone.', {
                                            title: 'Destructive action',
                                        })
                                    }
                                >
                                    Warning + title
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border"
                                    leftIcon={<Info className="w-4 h-4 text-blue-500"/>}
                                    onClick={() =>
                                        toast.info('Scheduled maintenance window: Sunday 02:00–04:00 UTC.', {
                                            title: 'System notice',
                                        })
                                    }
                                >
                                    Info + title
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Duration & stacking */}
                    <Card>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-admin-text">Custom duration & stacking</p>
                            <p className="text-xs text-admin-text-muted">
                                Pass <code className="text-primary font-mono">duration</code> (ms) to override the
                                default. Set <code className="text-primary font-mono">duration: 0</code> to keep the
                                toast until the user dismisses it. Firing several at once demonstrates stacking — the
                                queue is capped at&nbsp;5.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border"
                                    onClick={() =>
                                        toast.success('This will disappear in 1.5 s.', {duration: 1500})
                                    }
                                >
                                    Short (1.5 s)
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border"
                                    onClick={() =>
                                        toast.info('This stays until you close it.', {
                                            title: 'Persistent',
                                            duration: 0,
                                        })
                                    }
                                >
                                    Persistent
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border"
                                    onClick={() => {
                                        toast.success('Record saved.');
                                        toast.warning('Low disk space detected.', {title: 'Storage warning'});
                                        toast.error('Background sync failed.', {title: 'Sync error'});
                                        toast.info('3 tasks queued for processing.');
                                    }}
                                >
                                    Stack 4 at once
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Real-world patterns */}
                    <Card>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-admin-text">Real-world patterns</p>
                            <p className="text-xs text-admin-text-muted">
                                Typical admin actions — create, update, delete, and failed API request.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-1">
                                <Button
                                    variant="solid"
                                    size="sm"
                                    leftIcon={<Plus className="w-4 h-4"/>}
                                    onClick={() =>
                                        toast.success('Product "Wireless Headphones" was created.', {
                                            title: 'Product created',
                                        })
                                    }
                                >
                                    Create
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border"
                                    onClick={() =>
                                        toast.success('Changes to "Nike Air Max" have been saved.', {
                                            title: 'Product updated',
                                        })
                                    }
                                >
                                    Update
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border text-red-500 hover:text-red-500"
                                    onClick={() =>
                                        toast.warning('"Summer Sale" category has been deleted.', {
                                            title: 'Category deleted',
                                        })
                                    }
                                >
                                    Delete
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="border border-admin-border"
                                    onClick={() =>
                                        toast.error("We couldn't save your changes. Please try again.", {
                                            title: 'Save failed',
                                        })
                                    }
                                >
                                    Failed request
                                </Button>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Menu, Dialog, Drawer Triggers */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">Overlays &
                        Modals</h2>
                    <div className="flex flex-wrap gap-4">

                        {/* Standard Dropdown Menu */}
                        <Menu>
                            <MenuTrigger>
                                <Button variant="solid" rightIcon={<Search className="w-4 h-4 ml-2"/>}>Open
                                    Dropdown</Button>
                            </MenuTrigger>
                            <MenuList position="bottom-left">
                                <MenuSection label="Actions">
                                    <MenuItem>Reload page</MenuItem>
                                    <MenuItem>Save for later</MenuItem>
                                </MenuSection>
                                <MenuSeparator/>
                                <MenuItem disabled>System Settings (Disabled)</MenuItem>
                                <MenuItem className="text-red-500">Log out</MenuItem>
                            </MenuList>
                        </Menu>

                        <Button variant="ghost" className="border border-admin-border"
                                onClick={() => setIsDialogOpen(true)}>
                            Open Dialog
                        </Button>
                        <Button variant="ghost" className="border border-admin-border"
                                onClick={() => setIsDrawerOpen(true)}>
                            Open Drawer
                        </Button>

                    </div>
                </section>

                {/* The Dialog Component */}
                <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} size="md">
                    <DialogHeader
                        title="Create New Project"
                        description="Enter the details below to initialize a new project in the system."
                    />
                    <DialogContent className="space-y-4">
                        <InputField label="Project Name" placeholder="e.g. Q4 Marketing Campaign" required/>
                        <Select
                            label="Visibility"
                            options={[
                                {value: 'public', label: 'Public (Everyone can see)'},
                                {value: 'private', label: 'Private (Invite only)'},
                            ]}
                        />
                    </DialogContent>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button variant="solid" onClick={() => setIsDialogOpen(false)}>Create Project</Button>
                    </DialogFooter>
                </Dialog>

                {/* The Drawer Component */}
                <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} position="right" size="md">
                    <DrawerHeader
                        title="Filters"
                        description="Adjust your search criteria to narrow down the results."
                    />
                    <DrawerContent className="space-y-6">
                        <Select
                            label="Category"
                            options={[
                                {value: 'all', label: 'All Categories'},
                                {value: 'electronics', label: 'Electronics'},
                                {value: 'clothing', label: 'Clothing'},
                            ]}
                        />
                        <Select
                            label="Sort By"
                            options={[
                                {value: 'newest', label: 'Newest First'},
                                {value: 'price_asc', label: 'Price: Low to High'},
                                {value: 'price_desc', label: 'Price: High to Low'},
                            ]}
                        />
                    </DrawerContent>
                    <DrawerFooter>
                        <Button variant="ghost" fullWidth onClick={() => setIsDrawerOpen(false)}>Clear Filters</Button>
                        <Button variant="solid" fullWidth onClick={() => setIsDrawerOpen(false)}>Apply</Button>
                    </DrawerFooter>
                </Drawer>

            </div>
        </PageLayout>
    );
}

export default ComponentsDemo;
