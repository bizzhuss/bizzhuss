<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vendor_id' => 'required|exists:vendors,id',
            'category_id' => 'nullable|exists:categories,id',
            'category' => 'nullable|string|max:100',
            'title' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:products,sku',
            'price' => 'required|numeric|min:0.01',
            'compare_price' => 'nullable|numeric|gte:price',
            'stock_quantity' => 'nullable|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'description' => 'nullable|string|max:2000',
            'images' => 'nullable|array',
            'status' => 'nullable|in:pending_review,published,draft,active',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('stock') && !$this->has('stock_quantity')) {
            $this->merge(['stock_quantity' => $this->input('stock')]);
        }
        if ($this->input('status') === 'active') {
            $this->merge(['status' => 'published']);
        }
    }
}
