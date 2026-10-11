<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'assigned_to' => 'nullable|exists:users,id',
            'department' => 'nullable|string|max:100',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:todo,in_progress,review,completed',
            'due_date' => 'nullable|date',
        ];
    }
}
