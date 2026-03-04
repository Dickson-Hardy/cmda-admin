import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiDollarSign, FiServer, FiCheck } from "react-icons/fi";
import {
  useCreateServiceSubscriptionMutation,
  useUpdateServiceSubscriptionMutation,
  useRenewServiceSubscriptionMutation,
} from "../../../api/serviceSubscriptionsApi";
import { toast } from "react-toastify";

const ServiceSubscriptionModal = ({ subscription, onClose }) => {
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    category: "domain",
    provider: "",
    serviceUrl: "",
    purchaseDate: "",
    renewalDate: "",
    cost: "",
    currency: "USD",
    billingCycle: "monthly",
    autoRenewal: false,
    paymentMethod: "",
    accountEmail: "",
    accountUsername: "",
    reminderDays: 7,
    notes: "",
    status: "active",
  });

  const [createSubscription, { isLoading: isCreating }] = useCreateServiceSubscriptionMutation();
  const [updateSubscription, { isLoading: isUpdating }] = useUpdateServiceSubscriptionMutation();
  const [renewSubscription, { isLoading: isRenewing }] = useRenewServiceSubscriptionMutation();

  const [isRenewalMode, setIsRenewalMode] = useState(false);

  useEffect(() => {
    if (subscription) {
      setFormData({
        serviceName: subscription.serviceName || "",
        description: subscription.description || "",
        category: subscription.category || "domain",
        provider: subscription.provider || "",
        serviceUrl: subscription.serviceUrl || "",
        purchaseDate: subscription.purchaseDate ? new Date(subscription.purchaseDate).toISOString().split("T")[0] : "",
        renewalDate: subscription.renewalDate ? new Date(subscription.renewalDate).toISOString().split("T")[0] : "",
        cost: subscription.cost?.toString() || "",
        currency: subscription.currency || "USD",
        billingCycle: subscription.billingCycle || "monthly",
        autoRenewal: subscription.autoRenewal || false,
        paymentMethod: subscription.paymentMethod || "",
        accountEmail: subscription.accountEmail || "",
        accountUsername: subscription.accountUsername || "",
        reminderDays: subscription.reminderDays || 7,
        notes: subscription.notes || "",
        status: subscription.status || "active",
      });
    }
  }, [subscription]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.serviceName || !formData.provider || !formData.renewalDate || !formData.cost) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        cost: parseFloat(formData.cost),
        reminderDays: parseInt(formData.reminderDays, 10),
      };

      if (isRenewalMode && subscription) {
        // Renew subscription
        await renewSubscription({
          id: subscription._id,
          renewalDate: formData.renewalDate,
          cost: dataToSubmit.cost,
          notes: formData.notes,
        }).unwrap();
        toast.success("Service renewed successfully");
      } else if (subscription) {
        // Update existing subscription
        await updateSubscription({
          id: subscription._id,
          ...dataToSubmit,
        }).unwrap();
        toast.success("Service updated successfully");
      } else {
        // Create new subscription
        await createSubscription(dataToSubmit).unwrap();
        toast.success("Service created successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error saving subscription:", error);
      toast.error(error?.data?.message || "Failed to save service subscription");
    }
  };

  const isLoading = isCreating || isUpdating || isRenewing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiServer className="text-2xl" />
            <h2 className="text-xl font-bold">
              {isRenewalMode
                ? "Renew Service Subscription"
                : subscription
                  ? "Edit Service Subscription"
                  : "Add Service Subscription"}
            </h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Toggle Renewal Mode (only for existing subscriptions) */}
        {subscription && !isRenewalMode && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-100">
            <button
              onClick={() => setIsRenewalMode(true)}
              className="text-sm text-yellow-700 hover:text-yellow-900 flex items-center gap-2"
            >
              <FiCalendar />
              Switch to Renewal Mode
            </button>
          </div>
        )}

        {isRenewalMode && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-100 flex items-center justify-between">
            <span className="text-sm text-yellow-700 font-medium">Renewal Mode Active</span>
            <button onClick={() => setIsRenewalMode(false)} className="text-sm text-yellow-700 hover:text-yellow-900">
              Cancel Renewal Mode
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CMDA Main Domain"
                  required
                  disabled={isRenewalMode}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the service"
                  rows="2"
                  required
                  disabled={isRenewalMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isRenewalMode}
                >
                  <option value="domain">Domain Registration</option>
                  <option value="hosting">Web Hosting</option>
                  <option value="ssl_certificate">SSL Certificate</option>
                  <option value="software_license">Software License</option>
                  <option value="cloud_service">Cloud Storage</option>
                  <option value="api_service">API Service</option>
                  <option value="email_service">Email Service</option>
                  <option value="payment_gateway">Payment Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., GoDaddy, Namecheap, AWS"
                  required
                  disabled={isRenewalMode}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Service URL</label>
                <input
                  type="url"
                  name="serviceUrl"
                  value={formData.serviceUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  disabled={isRenewalMode}
                />
              </div>
            </div>

            {/* Dates and Billing */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiCalendar className="text-blue-600" />
                Dates & Billing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isRenewalMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renewal Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="renewalDate"
                    value={formData.renewalDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isRenewalMode}
                    >
                      <option value="USD">USD</option>
                      <option value="NGN">NGN</option>
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
                  <select
                    name="billingCycle"
                    value={formData.billingCycle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isRenewalMode}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                    <option value="biennially">Biennially</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Details */}
            {!isRenewalMode && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <input
                      type="text"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Credit Card ending in 1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Email</label>
                    <input
                      type="email"
                      name="accountEmail"
                      value={formData.accountEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="account@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Username</label>
                    <input
                      type="text"
                      name="accountUsername"
                      value={formData.accountUsername}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="expiring_soon">Expiring Soon</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Reminder Settings */}
            {!isRenewalMode && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Days Before Renewal</label>
                    <input
                      type="number"
                      name="reminderDays"
                      value={formData.reminderDays}
                      onChange={handleChange}
                      min="1"
                      max="90"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You'll receive an email alert this many days before renewal
                    </p>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      name="autoRenewal"
                      checked={formData.autoRenewal}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Auto-renewal enabled</label>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isRenewalMode ? "Add renewal notes..." : "Add any additional notes..."}
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiCheck />
                <span>{isRenewalMode ? "Renew Service" : subscription ? "Update Service" : "Create Service"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSubscriptionModal;
