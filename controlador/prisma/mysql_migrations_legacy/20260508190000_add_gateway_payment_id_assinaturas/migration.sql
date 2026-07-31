ALTER TABLE `assinaturas`
ADD COLUMN `gateway_payment_id` VARCHAR(120) NULL AFTER `gateway_subscription_id`;
