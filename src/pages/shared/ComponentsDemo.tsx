import * as React from 'react';
import {Search, Mail, User, MoreVertical, Plus} from 'lucide-react';
import {Button, Input, Menu, MenuItem, MenuList, MenuSection, MenuSeparator, MenuTrigger, Select} from "@/components";
import {PageContainer} from "@/components/layout/shared/PageContainer.tsx";
import {Dialog, DialogContent, DialogFooter, DialogHeader} from "@/components/shared/dialog/Dialog.tsx";
import {Drawer, DrawerContent, DrawerFooter, DrawerHeader} from "@/components/shared/drawer/Drawer";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";

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
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">Form
                        Elements</h2>
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

                {/* Data Table */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">Data
                        Table</h2>
                    <DataTable
                        columns={columns}
                        data={data}
                        pageSize={5}
                        sortable
                    />
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
