-- ============================================================
-- CodeLite AI: Development Seed Data
-- ============================================================

-- Note: Seed projects and initial mock benchmark runs can be linked to any user
-- Once a user signs up, these serve as templates or references.

-- Insert template benchmark runs for demonstration if needed
-- This allows instant preview of benchmark analytics
INSERT INTO public.benchmark_runs (
    id,
    user_id,
    task_name,
    workflow_type,
    model_name,
    input_tokens,
    output_tokens,
    cached_tokens,
    task_success,
    test_results,
    execution_time
) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'Create React Component', 'baseline', 'gemini-2.0-flash', 4200, 1250, 0, true, '{"tests_passed": 3}'::jsonb, 3200),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'Create React Component', 'optimized', 'gemini-2.0-flash', 1150, 480, 0, true, '{"tests_passed": 3}'::jsonb, 1150),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'Fix Login Bug', 'baseline', 'gemini-2.0-flash', 6800, 1800, 0, true, '{"tests_passed": 4}'::jsonb, 4800),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'Fix Login Bug', 'optimized', 'gemini-2.0-flash', 1850, 520, 0, true, '{"tests_passed": 4}'::jsonb, 1420),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'Add Dark Mode', 'baseline', 'gemini-2.0-flash', 5400, 1600, 0, true, '{"tests_passed": 2}'::jsonb, 3900),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'Add Dark Mode', 'optimized', 'gemini-2.0-flash', 1400, 490, 0, true, '{"tests_passed": 2}'::jsonb, 1300)
ON CONFLICT (id) DO NOTHING;

