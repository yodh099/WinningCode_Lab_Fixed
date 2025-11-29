-- Migration script to create conversations from existing messages
-- This groups messages by sender/recipient pairs

-- Create conversations for existing message threads
INSERT INTO conversations (client_id, subject, status, last_message_at, created_at)
SELECT DISTINCT ON (
    CASE 
        WHEN m.sender_id < m.recipient_id THEN m.sender_id
        ELSE m.recipient_id
    END,
    CASE 
        WHEN m.sender_id < m.recipient_id THEN m.recipient_id
        ELSE m.sender_id
    END
)
    -- Client is the one with 'client' role
    CASE 
        WHEN p1.role = 'client' THEN p1.id
        ELSE p2.id
    END as client_id,
    'Conversation with ' || COALESCE(p1.full_name, p1.email) as subject,
    'open' as status,
    MAX(m.created_at) as last_message_at,
    MIN(m.created_at) as created_at
FROM messages m
LEFT JOIN profiles p1 ON m.sender_id = p1.id
LEFT JOIN profiles p2 ON m.recipient_id = p2.id
WHERE m.conversation_id IS NULL
  AND m.sender_id IS NOT NULL
  AND m.recipient_id IS NOT NULL
GROUP BY 
    CASE 
        WHEN m.sender_id < m.recipient_id THEN m.sender_id
        ELSE m.recipient_id
    END,
    CASE 
        WHEN m.sender_id < m.recipient_id THEN m.recipient_id
        ELSE m.sender_id
    END,
    CASE 
        WHEN p1.role = 'client' THEN p1.id
        ELSE p2.id
    END,
    COALESCE(p1.full_name, p1.email);

-- Link existing messages to their conversations
UPDATE messages m
SET conversation_id = c.id
FROM conversations c
WHERE m.conversation_id IS NULL
  AND m.sender_id IS NOT NULL
  AND m.recipient_id IS NOT NULL
  AND (
    (c.client_id = m.sender_id AND EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = m.recipient_id AND p.role IN ('admin', 'staff')
    ))
    OR
    (c.client_id = m.recipient_id AND EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = m.sender_id AND p.role IN ('admin', 'staff')
    ))
  );
