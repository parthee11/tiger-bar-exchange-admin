import React from 'react';
import { Button } from '../ui/button';
import { RefreshCw, Edit, Gift, Mail, Phone, Award } from 'lucide-react';
import { Select } from '../ui/select';

const UserTable = ({
  users,
  loading,
  onLoyaltyClick,
  onCouponClick,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
}) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin inline-block">
          <RefreshCw className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-2 text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          No users found. Check your filters and try again.
        </p>
      </div>
    );
  }

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

  return (
    <>
      <div className="rounded-md border mx-4">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Email
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                  Loyalty Points
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                  Verified
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-medium">
                    {user.name}
                  </td>
                  <td className="p-4 align-middle text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-sm">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{user.loyaltyPoints}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.phoneVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.phoneVerified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => onLoyaltyClick(user)}
                        title="Manage Loyalty Points"
                      >
                        <Award className="h-3 w-3" /> Points
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => onCouponClick(user)}
                        title="Manage Coupons"
                      >
                        <Gift className="h-3 w-3" /> Coupon
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between py-4 mx-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfFirstItem + itemsPerPage, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span> users
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={itemsPerPage.toString()}
            onChange={onItemsPerPageChange}
            className="h-8 w-[70px]"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </Select>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to previous page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <span className="text-sm w-24">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to next page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserTable;
