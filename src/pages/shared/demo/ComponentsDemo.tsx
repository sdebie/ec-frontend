import * as React from 'react';
import {Search, Mail, User, MoreVertical, Plus, CheckCircle2, XCircle, AlertTriangle, Info} from 'lucide-react';
import {toast} from '@/components/shared/toast';
import {
    AdaptiveCard,
    Button,
    Input,
    Menu,
    MenuItem,
    MenuList,
    MenuSection,
    MenuSeparator,
    MenuTrigger,
    Select
} from "@/components";
import {PageContainer} from "@/components/layout/shared/PageContainer.tsx";
import {Dialog, DialogContent, DialogFooter, DialogHeader} from "@/components/shared/dialog/Dialog.tsx";
import {Drawer, DrawerContent, DrawerFooter, DrawerHeader} from "@/components/shared/drawer/Drawer.tsx";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import MixedFormControls from "@/pages/shared/demo/MixedFormControls.tsx";

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
                                         leftIcon={<MoreVertical className="w-4 h-4"/>}/></MenuTrigger>
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
        <PageContainer
            title="UI Components Sandbox"
            description="Interactive preview of all reusable, theme-aware components."
        >
            <div className="grid gap-12 max-w-5xl pb-20">

                {/* Buttons */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">Buttons</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <Button variant="solid">Solid Button</Button>
                        <Button variant="ghost">Ghost Button</Button>
                        <Button variant="plain">Plain Button</Button>
                        <Button variant="solid" loading>Loading</Button>
                        <Button variant="solid" leftIcon={<Plus className="w-4 h-4"/>}>With Icon</Button>
                        <Button variant="solid" disabled>Disabled</Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                    </div>
                </section>

                {/* Form Inputs & Select */}
                <AdaptiveCard>
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">
                            Form Elements
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Input
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    leftIcon={<Mail className="w-4 h-4"/>}
                                    required
                                />
                                <Input
                                    label="Username"
                                    placeholder="Choose a username"
                                    leftIcon={<User className="w-4 h-4"/>}
                                    helperText="Must be unique across the system."
                                />
                                <Input
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
                </AdaptiveCard>

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
                    <AdaptiveCard>
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
                    </AdaptiveCard>

                    {/* With title */}
                    <AdaptiveCard>
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
                    </AdaptiveCard>

                    {/* Duration & stacking */}
                    <AdaptiveCard>
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
                    </AdaptiveCard>

                    {/* Real-world patterns */}
                    <AdaptiveCard>
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
                    </AdaptiveCard>
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
                        <Input label="Project Name" placeholder="e.g. Q4 Marketing Campaign" required/>
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
        </PageContainer>
    );
}

export default ComponentsDemo;
