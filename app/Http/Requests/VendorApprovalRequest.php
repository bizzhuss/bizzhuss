<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VendorApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vendor_id' => 'required|exists:vendors,id',
            'status' => 'required|in:approved,rejected,pending,suspended',
            'commission_rate' => 'nullable|numeric|min:1|max:50',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
